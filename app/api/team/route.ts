import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MatchModel from "@/lib/models/Match";
import PlayerModel from "@/lib/models/Player";
import TrainingSessionModel from "@/lib/models/TrainingSession";
import { calcTeamStats, calcRollingTeamCondition, calcPlayerWeekSummaries } from "@/lib/stats";
import { Match, Player, TrainingSession } from "@/types";

export async function GET() {
  try {
    await connectDB();
    const [matches, players, sessions] = await Promise.all([
      MatchModel.find({}).sort({ date: 1 }).lean(),
      PlayerModel.find({}).lean(),
      TrainingSessionModel.find({}).sort({ date: 1 }).limit(10).lean(),
    ]);

    const { tc, ms } = calcRollingTeamCondition(sessions as unknown as TrainingSession[]);

    const stats = calcTeamStats(
      matches as unknown as Match[],
      players as unknown as Player[],
      tc,
      ms
    );

    // Last 7 days sessions for week summaries
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekSessions = (sessions as unknown as TrainingSession[]).filter(
      (s) => new Date(s.date) >= weekAgo
    );

    const weekSummaries = calcPlayerWeekSummaries(weekSessions, players as unknown as Player[]);

    return NextResponse.json({
      stats,
      condition: { trainingCondition: tc, mentalityScore: ms },
      weekSummaries,
      recentSessions: sessions.slice(-5),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch team stats" }, { status: 500 });
  }
}
