export const dynamic = "force-dynamic";

import connectDB from "@/lib/mongodb";
import PlayerModel from "@/lib/models/Player";
import MatchModel from "@/lib/models/Match";
import TrainingSessionModel from "@/lib/models/TrainingSession";
import { notFound } from "next/navigation";
import { Player, TrainingSession, Match } from "@/types";
import PlayerHero from "@/components/player/PlayerHero";
import PlayerRadarChart from "@/components/player/PlayerRadarChart";
import PlayerMatchHistory from "@/components/player/PlayerMatchHistory";
import PlayerTrainingLog from "@/components/player/PlayerTrainingLog";
import PlayerPRSTrend from "@/components/player/PlayerPRSTrend";
import PlayerMatchRatingChart from "@/components/player/PlayerMatchRatingChart";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { calcAvgRating, calcConsistencyScore, prsLabel } from "@/lib/stats";

interface Props {
  params: { id: string };
}

async function getData(id: string) {
  await connectDB();

  const [player, allMatches, allSessions] = await Promise.all([
    PlayerModel.findById(id).lean(),
    MatchModel.find({ "playerPerformances.playerId": id }).sort({ date: 1 }).lean(),
    TrainingSessionModel.find({ "playerLogs.playerId": id }).sort({ date: 1 }).lean(),
  ]);

  if (!player) return null;

  const matchPerformances = allMatches.map((m: any) => {
    const perf = m.playerPerformances.find(
      (p: any) => String(p.playerId) === String(id)
    );
    return {
      date: m.date,
      opponent: m.opponent,
      homeAway: m.homeAway,
      result: m.result,
      goalsFor: m.goalsFor,
      goalsAgainst: m.goalsAgainst,
      minutesPlayed: perf?.minutesPlayed ?? 0,
      goals: perf?.goals ?? 0,
      assists: perf?.assists ?? 0,
      rating: perf?.rating ?? 0,
      isMvp: perf?.isMvp ?? false,
      yellowCard: perf?.yellowCard ?? false,
      redCard: perf?.redCard ?? false,
    };
  });

  const sessionLogs = allSessions.map((s: any) => {
    const log = s.playerLogs.find(
      (l: any) => String(l.playerId) === String(id)
    );
    return {
      date: s.date,
      sessionType: s.sessionType,
      workRate: log?.workRate ?? 0,
      technicalQuality: log?.technicalQuality ?? 0,
      tacticalAwareness: log?.tacticalAwareness ?? 0,
      focusLevel: log?.focusLevel ?? 0,
      bodyLanguage: log?.bodyLanguage ?? 0,
      coachability: log?.coachability ?? 0,
      emotionalState: log?.emotionalState ?? "neutral",
      fatigueLevel: log?.fatigueLevel ?? 0,
      injuryFlag: log?.injuryFlag ?? false,
      minutesParticipated: log?.minutesParticipated ?? 0,
      prs: log?.prs ?? 0,
      readinessLabel: log?.readinessLabel ?? "monitor",
    };
  });

  // Radar averages across all sessions
  const radarData =
    sessionLogs.length > 0
      ? {
          workRate: parseFloat((sessionLogs.reduce((a, s) => a + s.workRate, 0) / sessionLogs.length).toFixed(1)),
          technicalQuality: parseFloat((sessionLogs.reduce((a, s) => a + s.technicalQuality, 0) / sessionLogs.length).toFixed(1)),
          tacticalAwareness: parseFloat((sessionLogs.reduce((a, s) => a + s.tacticalAwareness, 0) / sessionLogs.length).toFixed(1)),
          focusLevel: parseFloat((sessionLogs.reduce((a, s) => a + s.focusLevel, 0) / sessionLogs.length).toFixed(1)),
          bodyLanguage: parseFloat((sessionLogs.reduce((a, s) => a + s.bodyLanguage, 0) / sessionLogs.length).toFixed(1)),
          coachability: parseFloat((sessionLogs.reduce((a, s) => a + s.coachability, 0) / sessionLogs.length).toFixed(1)),
        }
      : null;

  // PRS trend
  const prsTrend = sessionLogs.map((s) => ({
    date: s.date,
    prs: Math.round(s.prs * 100),
    sessionType: s.sessionType,
  }));

  // Development arc
  const prsValues = sessionLogs.map((s) => s.prs);
  const early = prsValues.slice(0, Math.floor(prsValues.length / 3));
  const late = prsValues.slice(Math.floor((prsValues.length * 2) / 3));
  const earlyAvg = early.length ? early.reduce((a, b) => a + b, 0) / early.length : 0;
  const lateAvg = late.length ? late.reduce((a, b) => a + b, 0) / late.length : 0;
  const developmentArc =
    prsValues.length < 3
      ? "insufficient_data"
      : lateAvg - earlyAvg > 0.05
      ? "progressing"
      : lateAvg - earlyAvg < -0.05
      ? "regressing"
      : "plateauing";

  // Current PRS
  const lastPRS = sessionLogs.length ? sessionLogs[sessionLogs.length - 1].prs : 0;

  return {
    player: JSON.parse(JSON.stringify(player)) as Player,
    matchPerformances: JSON.parse(JSON.stringify(matchPerformances)),
    sessionLogs: JSON.parse(JSON.stringify(sessionLogs)),
    radarData,
    prsTrend,
    developmentArc,
    currentPRS: lastPRS,
    avgRating: calcAvgRating((player as any).ratings ?? []),
    consistency: calcConsistencyScore((player as any).ratings ?? []),
  };
}

export default async function PlayerPage({ params }: Props) {
  const data = await getData(params.id);
  if (!data) notFound();

  const { player, matchPerformances, sessionLogs, radarData, prsTrend, developmentArc, currentPRS, avgRating, consistency } = data;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <div className="border-b border-sky/10 bg-navy-950/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-sky/50 hover:text-white transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Dashboard
          </Link>
          <span className="text-sky/30 font-mono text-xs">
            DINAMO BATUMI U15 · PLAYER PROFILE
          </span>
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">
        {/* Hero */}
        <PlayerHero
          player={player}
          avgRating={avgRating}
          consistency={consistency}
          currentPRS={currentPRS}
          developmentArc={developmentArc}
          sessionCount={sessionLogs.length}
        />

        {/* Row 1: Radar + PRS Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PlayerRadarChart radarData={radarData} position={player.position} />
          <PlayerPRSTrend prsTrend={prsTrend} />
        </div>

        {/* Row 2: Match rating chart */}
        <PlayerMatchRatingChart matchPerformances={matchPerformances} avgRating={avgRating} />

        {/* Row 3: Training log */}
        <PlayerTrainingLog sessionLogs={sessionLogs} />

        {/* Row 4: Match history */}
        <PlayerMatchHistory matchPerformances={matchPerformances} />

        <footer className="text-center py-4">
          <p className="text-sky/20 font-mono text-xs">
            DINAMO BATUMI U15 · SQUAD HUB · {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  );
}
