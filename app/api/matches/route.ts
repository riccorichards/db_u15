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

    // ── Resolve opponent OSI ──────────────────────────────────────
    let resolvedOSI: number | null = null;
    const opponentId: string | null = body.opponentId ?? null;

    if (opponentId) {
      const OpponentModel = await getOpponentModel();
      if (OpponentModel) {
        const opponent = await OpponentModel.findById(opponentId).lean();
        if (opponent) {
          const { calcOSI } = await import("@/lib/stats");
          resolvedOSI = calcOSI(opponent as any);
        }
      }
    }

    // ── Resolve player positions upfront (fixes CMR position bug) ─
    const incomingPlayerIds = (body.playerPerformances ?? []).map(
      (p: any) => p.playerId,
    );
    const perfPlayers = await PlayerModel.find({
      _id: { $in: incomingPlayerIds },
    }).lean();
    const posMap = Object.fromEntries(
      perfPlayers.map((p) => [String(p._id), p.position as string]),
    );

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
      opponentId,
      osi: resolvedOSI,
      playerPerformances: (body.playerPerformances ?? []).map((perf: any) => ({
        playerId: perf.playerId,
        minutesPlayed: perf.minutesPlayed,
        goals: perf.goals,
        assists: perf.assists,
        rating: perf.rating,
        isMvp: perf.isMvp ?? false,
        yellowCard: perf.yellowCard ?? false,
        redCard: perf.redCard ?? false,
        defensiveContrib: perf.defensiveContrib ?? null,
        technicalExec: perf.technicalExec ?? null,
        tacticalDiscipline: perf.tacticalDiscipline ?? null,
        attackingContrib: perf.attackingContrib ?? null,
        mentalPerformance: perf.mentalPerformance ?? null,
        defensiveImpact: perf.defensiveImpact ?? null,
        osi: resolvedOSI,
      })),
    });

    // ── Compute CMR and officialRating per player ─────────────────
    const { calcCMR, calcOfficialRating } = await import("@/lib/stats");

    for (const perf of body.playerPerformances ?? []) {
      const position = posMap[String(perf.playerId)] ?? "MID";
      const criteria = {
        defensiveContrib: perf.defensiveContrib ?? null,
        technicalExec: perf.technicalExec ?? null,
        tacticalDiscipline: perf.tacticalDiscipline ?? null,
        attackingContrib: perf.attackingContrib ?? null,
        mentalPerformance: perf.mentalPerformance ?? null,
      };
      const cmr = calcCMR(criteria, position);
      const officialRating = calcOfficialRating(cmr, perf.rating, resolvedOSI);

      await MatchModel.updateOne(
        { _id: match._id, "playerPerformances.playerId": perf.playerId },
        {
          $set: {
            "playerPerformances.$.cmr": cmr,
            "playerPerformances.$.officialRating": officialRating,
          },
        },
      );
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
