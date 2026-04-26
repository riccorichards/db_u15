import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MatchModel from "@/lib/models/Match";
import PlayerModel from "@/lib/models/Player";
import { type DisciplineEvent } from "@/lib/stats";

// ─── Soft imports ─────────────────────────────────────────────────
async function getDisciplineLogModel() {
  try {
    return (await import("@/lib/models/DisciplineLog")).default;
  } catch {
    return null;
  }
}

async function getOpponentModel() {
  try {
    return (await import("@/lib/models/Opponent")).default;
  } catch {
    return null;
  }
}

async function writeDisciplineEvent(event: Omit<DisciplineEvent, never>) {
  const Model = await getDisciplineLogModel();
  if (!Model) return;
  try {
    await Model.create(event);
  } catch (err) {
    console.warn("DisciplineLog write failed:", err);
  }
}

// ─── GET ──────────────────────────────────────────────────────────
export async function GET() {
  try {
    await connectDB();
    const matches = await MatchModel.find({}).sort({ date: 1 }).lean();
    return NextResponse.json(matches);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 },
    );
  }
}

// ─── POST ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // ── Auto-calculate result ─────────────────────────────────────
    let result: "W" | "D" | "L" = "D";
    if (body.goalsFor > body.goalsAgainst) result = "W";
    else if (body.goalsFor < body.goalsAgainst) result = "L";

    // ── Resolve opponent OSI (if opponent model exists) ───────────
    // opponentId is optional — old matches and new matches without an
    // opponent profile attached will simply store null.
    let resolvedOSI: number | null = null;
    let opponentId: string | null = body.opponentId ?? null;

    if (opponentId) {
      const OpponentModel = await getOpponentModel();
      if (OpponentModel) {
        const opponent = await OpponentModel.findById(opponentId).lean();
        if (opponent) {
          // Lazy import to avoid circular issues
          const { calcOSI } = await import("@/lib/stats");
          resolvedOSI = calcOSI(opponent as any);
        }
      }
    }

    // ── Persist match ─────────────────────────────────────────────
    const match = await MatchModel.create({
      date: body.date,
      opponent: body.opponent,
      homeAway: body.homeAway,
      goalsFor: body.goalsFor,
      goalsAgainst: body.goalsAgainst,
      result,
      trainingCondition: body.trainingCondition,
      mentalityScore: body.mentalityScore,
      opponentId, // null for old matches — handled gracefully everywhere
      osi: resolvedOSI, // cached on match so dashboard doesn't re-fetch
      playerPerformances: (body.playerPerformances ?? []).map((perf: any) => ({
        playerId: perf.playerId,
        minutesPlayed: perf.minutesPlayed,
        goals: perf.goals,
        assists: perf.assists,
        rating: perf.rating,
        isMvp: perf.isMvp ?? false,
        yellowCard: perf.yellowCard ?? false,
        redCard: perf.redCard ?? false,
        // Structured match rating fields — null on old data, populated when coach
        // uses the new structured evaluation form in the admin panel.
        defensiveContrib: perf.defensiveContrib ?? null,
        technicalExec: perf.technicalExec ?? null,
        tacticalDiscipline: perf.tacticalDiscipline ?? null,
        attackingContrib: perf.attackingContrib ?? null,
        mentalPerformance: perf.mentalPerformance ?? null,
        // Defensive impact — single coach-rated field (1–10), null on old data.
        defensiveImpact: perf.defensiveImpact ?? null,
        // Computed and stored so IPMS can read pressure-response deltas without
        // re-fetching opponent data on every profile load.
        osi: resolvedOSI,
      })),
    });

    // ── Compute CMR and OfficialRating per player (if criteria present) ──
    // We do this after creation so we have the match._id, then update in place.
    const { calcCMR, calcOfficialRating } = await import("@/lib/stats");

    const performancesWithRatings = (body.playerPerformances ?? []).map(
      (perf: any) => {
        const position = "MID"; // will be overwritten per-player below
        const criteria = {
          defensiveContrib: perf.defensiveContrib ?? null,
          technicalExec: perf.technicalExec ?? null,
          tacticalDiscipline: perf.tacticalDiscipline ?? null,
          attackingContrib: perf.attackingContrib ?? null,
          mentalPerformance: perf.mentalPerformance ?? null,
        };
        return { playerId: perf.playerId, criteria, coachRating: perf.rating };
      },
    );

    // Fetch positions for CMR calculation
    const perfPlayerIds = performancesWithRatings.map((p: any) => p.playerId);
    const perfPlayers = await PlayerModel.find({
      _id: { $in: perfPlayerIds },
    }).lean();
    const posMap = Object.fromEntries(
      perfPlayers.map((p) => [String(p._id), p.position as string]),
    );

    // Update each performance with computed CMR + OfficialRating
    for (const p of performancesWithRatings) {
      const position = posMap[String(p.playerId)] ?? "MID";
      const cmr = calcCMR(p.criteria, position);
      const officialRating = calcOfficialRating(
        cmr,
        p.coachRating,
        resolvedOSI,
      );
      await MatchModel.updateOne(
        { _id: match._id, "playerPerformances.playerId": p.playerId },
        {
          $set: {
            "playerPerformances.$.cmr": cmr,
            "playerPerformances.$.officialRating": officialRating,
          },
        },
      );
    }

    // ── Update player cumulative stats ────────────────────────────
    for (const perf of body.playerPerformances ?? []) {
      const update: Record<string, unknown> = {
        $inc: {
          gamesPlayed: perf.minutesPlayed > 0 ? 1 : 0,
          minutesPlayed: perf.minutesPlayed,
          goals: perf.goals,
          assists: perf.assists,
          mvpCount: perf.isMvp ? 1 : 0,
          yellowCards: perf.yellowCard ? 1 : 0,
          redCards: perf.redCard ? 1 : 0,
        },
        $push: { ratings: perf.rating },
      };
      await PlayerModel.findByIdAndUpdate(perf.playerId, update);
    }

    // ── Write discipline events for cards ─────────────────────────
    for (const perf of body.playerPerformances ?? []) {
      if (perf.yellowCard) {
        await writeDisciplineEvent({
          playerId: String(perf.playerId),
          type: "yellow_card",
          date: body.date,
        });
      }
      if (perf.redCard) {
        await writeDisciplineEvent({
          playerId: String(perf.playerId),
          type: "red_card",
          date: body.date,
        });
      }
    }

    return NextResponse.json(match, { status: 201 });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to create match";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
