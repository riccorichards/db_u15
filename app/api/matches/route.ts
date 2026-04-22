import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MatchModel from "@/lib/models/Match";
import PlayerModel from "@/lib/models/Player";

export async function GET() {
  try {
    await connectDB();
    const matches = await MatchModel.find({}).sort({ date: 1 }).lean();
    return NextResponse.json(matches);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Auto-calculate result
    let result: "W" | "D" | "L" = "D";
    if (body.goalsFor > body.goalsAgainst) result = "W";
    else if (body.goalsFor < body.goalsAgainst) result = "L";

    const match = await MatchModel.create({
      date: body.date,
      opponent: body.opponent,
      homeAway: body.homeAway,
      goalsFor: body.goalsFor,
      goalsAgainst: body.goalsAgainst,
      result,
      trainingCondition: body.trainingCondition,
      mentalityScore: body.mentalityScore,
      playerPerformances: body.playerPerformances || [],
    });

    // Update player stats from this match
    for (const perf of body.playerPerformances || []) {
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

    return NextResponse.json(match, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create match";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
