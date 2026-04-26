export const dynamic = "force-dynamic";

import { Suspense } from "react";
import connectDB from "@/lib/mongodb";
import MatchModel from "@/lib/models/Match";
import PlayerModel from "@/lib/models/Player";
import TrainingSessionModel from "@/lib/models/TrainingSession";
import {
  calcTeamStats,
  calcRollingTeamCondition,
  calcPlayerWeekSummaries,
  calcMPI,
  calcSQI,
  calcWinProbability,
  calcPillarScores,
  calcProductionProfile,
  calcAttendanceRate,
  detectInjuryRisk,
  calcDisciplineScore,
  type PillarAssessment,
  type DisciplineEvent,
} from "@/lib/stats";
import {
  Match,
  Player,
  TrainingSession,
  MPI,
  TeamCondition,
  NextMatchOutlook,
  PlayerExtended,
  DisciplineRanking,
} from "@/types";
import Header from "@/components/home/Header";
import RankingTable from "@/components/home/RankingTable";
import RatingChart from "@/components/home/RatingChart";
import TeamStatsGrid from "@/components/home/TeamStatsGrid";
import MatchReadiness from "@/components/home/MatchReadiness";
import Top5Widget from "@/components/home/Top5Widget";
import TrainingTrendChart from "@/components/home/TrainingTrendChart";
import WinProbabilityCard from "@/components/home/WinProbabilityCard";
import DisciplineWatch from "@/components/home/DisciplineWatch";
import Link from "next/link";
import { Settings } from "lucide-react";

async function getPlayerAttributeModel() {
  try {
    return (await import("@/lib/models/PlayerAttribute")).default;
  } catch {
    return null;
  }
}
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

async function getData() {
  await connectDB();

  const [matches, players, allSessions] = await Promise.all([
    MatchModel.find({}).sort({ date: 1 }).lean(),
    PlayerModel.find({}).sort({ number: 1 }).lean(),
    TrainingSessionModel.find({}).sort({ date: 1 }).limit(20).lean(),
  ]);

  const typedMatches = matches as unknown as Match[];
  const typedPlayers = players as unknown as Player[];
  const typedSessions = allSessions as unknown as TrainingSession[];

  // OSI map from cached match.osi fields
  const osiMap: Record<string, number> = {};
  matches.forEach((m: any) => {
    if (m.osi != null) osiMap[String(m._id)] = m.osi;
  });

  // Rolling TC / MS
  const { tc, ms, formulaVersion, sessionCount } =
    calcRollingTeamCondition(typedSessions);
  const condition: TeamCondition = {
    trainingCondition: tc,
    mentalityScore: ms,
    formulaVersion,
    sessionCount,
  };

  // MPI
  const ratingHistory = typedMatches.map((m) => {
    const perfs = m.playerPerformances;
    if (!perfs.length) return 5;
    return (
      perfs.reduce(
        (a: number, p: any) => a + (p.officialRating ?? p.rating),
        0,
      ) / perfs.length
    );
  });
  const mpi: MPI = calcMPI(ratingHistory);

  // SQI — optional, defaults to 0.5 until pillar data exists
  let sqi = 0.5;
  const PlayerAttributeModel = await getPlayerAttributeModel();
  if (PlayerAttributeModel) {
    const allAssessments = (await PlayerAttributeModel.find(
      {},
    ).lean()) as unknown as PillarAssessment[];

    const posMap = Object.fromEntries(
      typedPlayers.map((p) => [String(p._id), p.position]),
    );
    const pillarOveralls = typedPlayers
      .map((player) => {
        const playerAssessments = allAssessments.filter(
          (a) => String(a.playerId) === String(player._id),
        );
        if (!playerAssessments.length) return null;
        return calcPillarScores(
          playerAssessments,
          posMap[String(player._id)] ?? "MID",
        ).overall;
      })
      .filter((v): v is number => v !== null);
    if (pillarOveralls.length > 0) sqi = calcSQI(pillarOveralls);
  }

  // Team stats
  const stats = calcTeamStats(
    typedMatches,
    typedPlayers,
    tc,
    ms,
    mpi,
    sqi,
    osiMap,
  );

  // Next match outlook — optional, needs Opponent model
  let nextMatchOutlook: NextMatchOutlook | null = null;
  const OpponentModel = await getOpponentModel();
  if (OpponentModel) {
    const { calcOSI } = await import("@/lib/stats");
    const nextOpponent = (await OpponentModel.findOne({ upcoming: true })
      .sort({ createdAt: -1 })
      .lean()) as any;
    if (nextOpponent) {
      const osi = calcOSI(nextOpponent);
      nextMatchOutlook = {
        opponentName: nextOpponent.name,
        osi,
        winProbability: calcWinProbability(stats.matchReadinessScore, osi),
      };
    }
  }

  // Week summaries for Top5 widget
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekSessions = typedSessions.filter((s) => new Date(s.date) >= weekAgo);
  const weekSummaries = calcPlayerWeekSummaries(weekSessions, typedPlayers);

  // Per-player production profile + attendance + injury risk
  const playerExtended: PlayerExtended[] = typedPlayers.map((player) => {
    const pid = String(player._id);
    return {
      playerId: pid,
      productionProfile: calcProductionProfile(player, typedMatches),
      attendanceRate: calcAttendanceRate(pid, typedSessions),
      injuryRisk: detectInjuryRisk(pid, typedSessions),
    };
  });

  // Discipline rankings — optional, needs DisciplineLog model
  let disciplineRankings: DisciplineRanking[] = [];
  const DisciplineLogModel = await getDisciplineLogModel();
  if (DisciplineLogModel) {
    const events = (await DisciplineLogModel.find(
      {},
    ).lean()) as unknown as DisciplineEvent[];
    disciplineRankings = typedPlayers
      .map((player) => {
        const pid = String(player._id);
        const pEvents = events.filter((e) => String(e.playerId) === pid);
        return {
          playerId: pid,
          name: `${player.name} ${player.surname}`,
          score: calcDisciplineScore(pEvents),
        };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, 5);
  }

  // Session trend data for TrainingTrendChart
  const sessionTrend = typedSessions.slice(-10).map((s: any) => ({
    date: s.date,
    tc: Math.round(s.teamTC * 100),
    ms: Math.round(s.teamMS * 100),
    type: s.sessionType,
    formulaVersion: s.formulaVersion ?? 1,
  }));

  // Serialize everything through JSON to strip ObjectId and other Mongoose class instances.
  // Next.js cannot pass class instances from Server → Client Components.
  const serialize = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

  return {
    stats: serialize(stats),
    condition: serialize(condition),
    mpi: serialize(mpi),
    sqi,
    nextMatchOutlook: serialize(nextMatchOutlook),
    weekSummaries: serialize(weekSummaries),
    playerExtended: serialize(playerExtended),
    disciplineRankings: serialize(disciplineRankings),
    sessionTrend: serialize(sessionTrend),
    players: serialize(players) as unknown as Player[],
  };
}

export default async function HomePage() {
  const {
    stats,
    condition,
    mpi,
    sqi,
    nextMatchOutlook,
    weekSummaries,
    playerExtended,
    disciplineRankings,
    sessionTrend,
    players,
  } = await getData();

  const productionMap = Object.fromEntries(
    playerExtended.map((pe) => [pe.playerId, pe.productionProfile]),
  );

  return (
    <div className="min-h-screen">
      <Header stats={stats} />

      <div className="max-w-screen-xl mx-auto px-6 pt-2 flex justify-end">
        <Link
          href="/admin"
          className="glass rounded-xl px-4 py-2 text-xs font-mono text-sky/50 hover:text-white transition-colors flex items-center gap-2"
        >
          <Settings size={12} />
          Admin Panel
        </Link>
      </div>

      <main className="max-w-screen-xl mx-auto px-6 py-6 space-y-5">
        {/* Row 1: Team stats (compact) + Match Readiness (content-heavy, wider) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5">
          <TeamStatsGrid stats={stats} />
          <MatchReadiness
            stats={stats}
            mpi={mpi}
            sqi={sqi}
            condition={condition}
          />
        </div>

        {/* Row 2: Win Probability + Rating chart — shorter cards, side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <WinProbabilityCard
            outlook={nextMatchOutlook}
            mrs={stats.matchReadinessScore}
          />
          <RatingChart stats={stats} />
        </div>

        {/* Row 3: Top 5 this week + Training TC/MS trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Top5Widget summaries={weekSummaries} />
          <TrainingTrendChart sessions={sessionTrend} condition={condition} />
        </div>

        {/* Row 4: Discipline Watch — only renders once DisciplineLog model exists */}
        {disciplineRankings.length > 0 && (
          <DisciplineWatch rankings={disciplineRankings} />
        )}

        {/* Row 5: Ranking table */}
        <Suspense
          fallback={
            <div className="glass rounded-2xl h-64 flex items-center justify-center">
              <span className="text-sky/40 font-mono text-sm animate-pulse">
                Loading rankings...
              </span>
            </div>
          }
        >
          <RankingTable players={players} productionMap={productionMap} />
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
