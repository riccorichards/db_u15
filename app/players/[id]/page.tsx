export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import PlayerModel from "@/lib/models/Player";
import MatchModel from "@/lib/models/Match";
import TrainingSessionModel from "@/lib/models/TrainingSession";
import {
  calcAvgRating,
  calcConsistencyScore,
  calcProductionProfile,
  calcAttendanceRate,
  calcDevelopmentArc,
  calcRollingPRS,
  calcPillarScores,
  calcIPMS,
  calcDisciplineScore,
  calcKPIProgress,
  detectInjuryRisk,
  calcCMR,
  calcOfficialRating,
  type PillarAssessment,
  type DisciplineEvent,
  type KPITarget,
} from "@/lib/stats";
import { TrainingSession, Match, Player } from "@/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PlayerHero from "@/components/player/PlayerHero";
import PlayerPRSTrend from "@/components/player/PlayerPRSTrend";
import PlayerMatchRatingChart from "@/components/player/PlayerMatchRatingChart";
import PlayerRadarChart from "@/components/player/PlayerRadarChart";
import PlayerMatchHistory from "@/components/player/PlayerMatchHistory";
import PlayerTrainingLog from "@/components/player/PlayerTrainingLog";
import PillarRadar from "@/components/player/PillarRadar";
import IPMSCard from "@/components/player/IPMSCard";
import KPIRadar from "@/components/player/KPIRadar";

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
async function getPlayerKPIModel() {
  try {
    return (await import("@/lib/models/PlayerKPI")).default;
  } catch {
    return null;
  }
}

const CURRENT_SEASON = "2025/26";

function getSeasonWeeks() {
  const seasonStart = new Date("2025-09-01");
  const seasonEnd = new Date("2026-05-31");
  const now = new Date();
  const totalMs = seasonEnd.getTime() - seasonStart.getTime();
  const elapsedMs = Math.max(0, now.getTime() - seasonStart.getTime());
  const total = Math.round(totalMs / (7 * 24 * 60 * 60 * 1000));
  const elapsed = Math.min(
    total,
    Math.round(elapsedMs / (7 * 24 * 60 * 60 * 1000)),
  );
  return { total, elapsed };
}

async function getData(id: string) {
  await connectDB();

  const [player, allMatches, allSessions] = await Promise.all([
    PlayerModel.findById(id).lean(),
    MatchModel.find({}).sort({ date: 1 }).lean(),
    TrainingSessionModel.find({}).sort({ date: 1 }).lean(),
  ]);

  if (!player) return null;

  const typedPlayer = JSON.parse(JSON.stringify(player)) as Player;
  const typedMatches = allMatches as unknown as Match[];
  const typedSessions = allSessions as unknown as TrainingSession[];
  const position = typedPlayer.position ?? "MID";

  const osiMap: Record<string, number> = {};
  allMatches.forEach((m: any) => {
    if (m.osi != null) osiMap[String(m._id)] = m.osi;
  });

  const matchHistory = typedMatches
    .map((m) => {
      const perf = m.playerPerformances.find((p) => String(p.playerId) === id);
      if (!perf) return null;
      const cmrCriteria = {
        defensiveContrib: (perf as any).defensiveContrib ?? null,
        technicalExec: (perf as any).technicalExec ?? null,
        tacticalDiscipline: (perf as any).tacticalDiscipline ?? null,
        attackingContrib: (perf as any).attackingContrib ?? null,
        mentalPerformance: (perf as any).mentalPerformance ?? null,
      };
      const cmr = calcCMR(cmrCriteria, position);
      const osi = osiMap[String((m as any)._id)] ?? null;
      const officialRating =
        (perf as any).officialRating ??
        calcOfficialRating(cmr, perf.rating, osi);
      return {
        matchId: String((m as any)._id),
        date: m.date,
        opponent: m.opponent,
        homeAway: m.homeAway,
        result: m.result,
        goalsFor: m.goalsFor,
        goalsAgainst: m.goalsAgainst,
        osi,
        minutesPlayed: perf.minutesPlayed,
        goals: perf.goals,
        assists: perf.assists,
        rating: perf.rating,
        officialRating,
        cmr,
        isMvp: perf.isMvp,
        yellowCard: perf.yellowCard,
        redCard: perf.redCard,
        defensiveImpact: (perf as any).defensiveImpact ?? null,
        cmrCriteria,
      };
    })
    .filter(Boolean) as any[];

  const sessionHistory = typedSessions
    .map((s) => {
      const log = s.playerLogs.find((l) => String(l.playerId) === id);
      if (!log) return null;
      return {
        sessionId: String((s as any)._id),
        date: s.date,
        sessionType: (s as any).sessionType,
        prs: log.prs,
        formulaVersion: (log as any).formulaVersion ?? 1,
        readinessLabel: log.readinessLabel,
        workRate: log.workRate,
        technicalQuality: log.technicalQuality,
        tacticalAwareness: log.tacticalAwareness,
        focusLevel: log.focusLevel,
        bodyLanguage: log.bodyLanguage,
        coachability: log.coachability,
        emotionalState: log.emotionalState,
        fatigueLevel: log.fatigueLevel,
        injuryFlag: log.injuryFlag,
        minutesParticipated: log.minutesParticipated,
      };
    })
    .filter(Boolean);

  const ratings = (matchHistory as any[])
    .map((m) => m.officialRating ?? m.rating)
    .filter((r): r is number => r != null);
  const avgRating = calcAvgRating(ratings);
  const consistencyScore = calcConsistencyScore(ratings);
  const productionProfile = calcProductionProfile(typedPlayer, typedMatches);
  const attendanceRate = calcAttendanceRate(id, typedSessions);
  const injuryRisk = detectInjuryRisk(id, typedSessions);

  const v2Count = typedSessions.filter(
    (s) => (s as any).formulaVersion === 2,
  ).length;
  const minVersion: 1 | 2 = v2Count >= 3 ? 2 : 1;
  const rollingPRS = calcRollingPRS(id, typedSessions, minVersion);
  const rollingPRSLabel =
    rollingPRS === null
      ? null
      : rollingPRS >= 0.75
        ? "match_ready"
        : rollingPRS >= 0.5
          ? "monitor"
          : "rest";

  const allPRS = typedSessions.flatMap((s) => {
    const log = s.playerLogs.find((l) => String(l.playerId) === id);
    return log ? [log.prs * 100] : [];
  });
  const seasonAvgPRS = allPRS.length
    ? parseFloat((allPRS.reduce((a, b) => a + b, 0) / allPRS.length).toFixed(1))
    : 0;
  const developmentArc = calcDevelopmentArc(id, typedSessions, minVersion);

  let pillarScores = {
    physical: 5,
    technical: 5,
    tactical: 5,
    mental: 5,
    overall: 5,
    weeklySnapshots: 0,
  };
  let pillarAssessments: PillarAssessment[] = [];
  const PlayerAttributeModel = await getPlayerAttributeModel();
  if (PlayerAttributeModel) {
    const raw = await PlayerAttributeModel.find({ playerId: id })
      .sort({ weekOf: 1 })
      .lean();
    pillarAssessments = raw as unknown as PillarAssessment[];
    if (pillarAssessments.length > 0)
      pillarScores = calcPillarScores(pillarAssessments, position);
  }

  const ipms = calcIPMS(id, typedSessions, typedMatches, osiMap);

  let disciplineScore = 100;
  let disciplineEvents: DisciplineEvent[] = [];
  const DisciplineLogModel = await getDisciplineLogModel();
  if (DisciplineLogModel) {
    const raw = await DisciplineLogModel.find({ playerId: id })
      .sort({ date: -1 })
      .lean();
    disciplineEvents = raw as unknown as DisciplineEvent[];
    disciplineScore = calcDisciplineScore(disciplineEvents);
  }

  let kpiProgress = null;
  const PlayerKPIModel = await getPlayerKPIModel();
  if (PlayerKPIModel) {
    const kpiDoc = (await PlayerKPIModel.findOne({
      playerId: id,
      season: CURRENT_SEASON,
    }).lean()) as any;
    if (kpiDoc) {
      const targets = kpiDoc.targets as KPITarget;
      const currentValues: Record<string, number> = {
        prsAvg: seasonAvgPRS,
        goals: typedPlayer.goals ?? 0,
        avgRating,
        attendanceRate,
        consistencyScore,
        disciplineScore,
        pillarOverall: pillarScores.overall,
      };
      const { total, elapsed } = getSeasonWeeks();
      kpiProgress = {
        targets,
        progress: calcKPIProgress(targets, currentValues, elapsed, total),
        currentValues,
        weeksElapsed: elapsed,
        weeksRemaining: total - elapsed,
      };
    }
  }

  const metricKeys = [
    "workRate",
    "technicalQuality",
    "tacticalAwareness",
    "focusLevel",
    "bodyLanguage",
    "coachability",
  ] as const;
  const trainingRadar = Object.fromEntries(
    metricKeys.map((key) => {
      const vals = (sessionHistory as any[])
        .map((s) => s?.[key])
        .filter((v): v is number => typeof v === "number");
      return [
        key,
        vals.length
          ? parseFloat(
              (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
            )
          : 0,
      ];
    }),
  );

  const serialize = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

  return {
    player: serialize(typedPlayer),
    avgRating,
    consistencyScore,
    attendanceRate,
    disciplineScore,
    seasonAvgPRS,
    injuryRisk,
    productionProfile: serialize(productionProfile),
    rollingPRS,
    rollingPRSLabel: rollingPRSLabel as
      | "match_ready"
      | "monitor"
      | "rest"
      | null,
    developmentArc: serialize(developmentArc),
    pillarScores: serialize(pillarScores),
    ipms: serialize(ipms),
    trainingRadar,
    kpiProgress: serialize(kpiProgress),
    matchHistory: serialize(matchHistory),
    sessionHistory: serialize(sessionHistory),
    pillarAssessments: serialize(pillarAssessments),
    disciplineEvents: serialize(disciplineEvents.slice(0, 20)),
  };
}

export default async function PlayerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getData(params.id);
  if (!data) notFound();

  const {
    player,
    avgRating,
    consistencyScore,
    attendanceRate,
    disciplineScore,
    seasonAvgPRS,
    injuryRisk,
    productionProfile,
    rollingPRS,
    rollingPRSLabel,
    developmentArc,
    pillarScores,
    ipms,
    trainingRadar,
    kpiProgress,
    matchHistory,
    sessionHistory,
    pillarAssessments,
  } = data;

  const prsTrend = (sessionHistory as any[]).map((s) => ({
    date: s.date,
    prs: Math.round(s.prs * 100),
    sessionType: s.sessionType,
    formulaVersion: s.formulaVersion,
  }));

  const matchPerfsForChart = (matchHistory as any[]).map((m) => ({
    date: m.date,
    opponent: m.opponent,
    result: m.result,
    rating: m.officialRating ?? m.rating,
    goals: m.goals,
    assists: m.assists,
    isMvp: m.isMvp,
    minutesPlayed: m.minutesPlayed,
  }));

  const radarData = Object.values(trainingRadar).some((v) => (v as number) > 0)
    ? (trainingRadar as any)
    : null;
  const hasPillars = pillarAssessments.length > 0;
  const hasIPMS = ipms.trainingSignal > 0 || sessionHistory.length > 0;

  return (
    <div className="min-h-screen">
      <div className="border-b border-sky/10 bg-navy-950/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-sky/50 hover:text-white transition-colors"
          >
            <ArrowLeft size={12} />
            Dashboard
          </Link>
          <span className="text-sky/30 font-mono text-xs">
            {player.name.toUpperCase()} {player.surname.toUpperCase()} · #
            {player.number}
          </span>
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">
        <PlayerHero
          player={player}
          avgRating={avgRating}
          consistency={consistencyScore}
          rollingPRS={rollingPRS}
          rollingPRSLabel={rollingPRSLabel}
          developmentArc={developmentArc}
          sessionCount={sessionHistory.length}
          productionProfile={productionProfile}
          attendanceRate={attendanceRate}
          disciplineScore={disciplineScore}
          injuryRisk={injuryRisk}
        />

        {(hasPillars || hasIPMS) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PillarRadar
              pillarScores={pillarScores}
              assessmentCount={pillarAssessments.length}
              position={player.position}
            />
            <IPMSCard ipms={ipms} matchCount={(matchHistory as any[]).length} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PlayerPRSTrend prsTrend={prsTrend} />
          <PlayerMatchRatingChart
            matchPerformances={matchPerfsForChart}
            avgRating={avgRating}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PlayerRadarChart radarData={radarData} position={player.position} />
          <KPIRadar kpiProgress={kpiProgress} />
        </div>

        <PlayerMatchHistory matchHistory={matchHistory as any} />
        <PlayerTrainingLog sessionHistory={sessionHistory as any} />
      </main>
    </div>
  );
}
