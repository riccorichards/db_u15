export const dynamic = "force-dynamic";

import { Suspense } from "react";
import connectDB from "@/lib/mongodb";
import PlayerModel from "@/lib/models/Player";
import MatchModel from "@/lib/models/Match";
import TrainingSessionModel from "@/lib/models/TrainingSession";
import {
  calcTeamStats,
  calcRollingTeamCondition,
  calcPlayerWeekSummaries,
} from "@/lib/stats";
import { Match, Player, PlayerWeekSummary, TrainingSession } from "@/types";
import Header from "@/components/home/Header";
import RankingTable from "@/components/home/RankingTable";
import RatingChart from "@/components/home/RatingChart";
import TeamStatsGrid from "@/components/home/TeamStatsGrid";
import MatchReadiness from "@/components/home/MatchReadiness";
import Top5Widget from "@/components/home/Top5Widget";
import TrainingTrendChart from "@/components/home/TrainingTrendChart";
import Link from "next/link";
import { Settings } from "lucide-react";

async function getData() {
  await connectDB();
  const [players, matches, allSessions] = await Promise.all([
    PlayerModel.find({}).sort({ number: 1 }).lean(),
    MatchModel.find({}).sort({ date: 1 }).lean(),
    TrainingSessionModel.find({}).sort({ date: 1 }).limit(20).lean(),
  ]);

  // Rolling TC/MS from sessions
  const { tc, ms } = calcRollingTeamCondition(
    allSessions as unknown as TrainingSession[],
  );

  const stats = calcTeamStats(
    matches as unknown as Match[],
    players as unknown as Player[],
    tc,
    ms,
  );

  // Last 7 days for weekly summaries
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekSessions = (allSessions as unknown as TrainingSession[]).filter(
    (s) => new Date(s.date) >= weekAgo,
  );

  const weekSummaries = calcPlayerWeekSummaries(
    weekSessions,
    players as unknown as Player[],
  );

  // Last 10 sessions for TC/MS trend chart
  const sessionTrend = (allSessions as unknown as TrainingSession[])
    .slice(-10)
    .map((s) => ({
      date: s.date,
      tc: Math.round(s.teamTC * 100),
      ms: Math.round(s.teamMS * 100),
      type: s.sessionType,
    }));

  return {
    players: JSON.parse(JSON.stringify(players)) as Player[],
    stats,
    weekSummaries: JSON.parse(
      JSON.stringify(weekSummaries),
    ) as PlayerWeekSummary[],
    sessionTrend: JSON.parse(JSON.stringify(sessionTrend)),
  };
}

export default async function HomePage() {
  const { players, stats, weekSummaries, sessionTrend } = await getData();

  return (
    <div className="min-h-screen">
      <Header stats={stats} />

      {/* Admin link */}
      <div className="max-w-screen-xl mx-auto px-6 pt-2 flex justify-end">
        <Link
          href="/admin"
          className="glass rounded-xl px-4 py-2 text-xs font-mono text-sky/50 hover:text-white transition-colors flex items-center gap-2"
        >
          <Settings size={12} />
          Admin Panel
        </Link>
      </div>

      <main className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">
        {/* Row 1: Team stats + MRS + Rating chart */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <TeamStatsGrid stats={stats} />
          <MatchReadiness stats={stats} />
          <RatingChart stats={stats} />
        </div>

        {/* Row 2: Top 5 this week + Training TC/MS trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Top5Widget summaries={weekSummaries} />
          <TrainingTrendChart sessions={sessionTrend} />
        </div>

        {/* Row 3: Ranking table */}
        <Suspense
          fallback={
            <div className="glass rounded-2xl h-64 flex items-center justify-center">
              <span className="text-sky/40 font-mono text-sm animate-pulse">
                Loading rankings...
              </span>
            </div>
          }
        >
          <RankingTable players={players} />
        </Suspense>

        <footer className="text-center py-4">
          <p className="text-sky/20 font-mono text-xs">
            DINAMO BATUMI U15 · SQUAD HUB · {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  );
}
