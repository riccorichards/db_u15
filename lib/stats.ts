import {
  Match,
  Player,
  PlayerSessionLog,
  PlayerWeekSummary,
  TeamStats,
  TrainingSession,
} from "@/types";

// ─── Position-specific weights ────────────────────────────────────
const POS_WEIGHTS: Record<string, Record<string, number>> = {
  GK:  { workRate: 0.15, technicalQuality: 0.20, tacticalAwareness: 0.30, focusLevel: 0.20, coachability: 0.15 },
  DEF: { workRate: 0.20, technicalQuality: 0.20, tacticalAwareness: 0.30, focusLevel: 0.15, coachability: 0.15 },
  MID: { workRate: 0.25, technicalQuality: 0.25, tacticalAwareness: 0.25, focusLevel: 0.15, coachability: 0.10 },
  FWD: { workRate: 0.25, technicalQuality: 0.30, tacticalAwareness: 0.20, focusLevel: 0.15, coachability: 0.10 },
};

// ─── Match stats helpers ──────────────────────────────────────────
export function calcAvgRating(ratings: number[]): number {
  if (!ratings.length) return 0;
  return parseFloat(
    (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
  );
}

export function calcConsistencyScore(ratings: number[]): number {
  if (ratings.length < 2) return 100;
  const avg = calcAvgRating(ratings);
  const variance =
    ratings.reduce((acc, r) => acc + Math.pow(r - avg, 2), 0) / ratings.length;
  const stdDev = Math.sqrt(variance);
  return parseFloat(Math.max(0, 100 - stdDev * 20).toFixed(1));
}

export function calcFormIndex(matches: Match[]): number {
  const last5 = matches.slice(-5);
  const points = last5.reduce((acc, m) => {
    if (m.result === "W") return acc + 3;
    if (m.result === "D") return acc + 1;
    return acc;
  }, 0);
  return parseFloat(((points / 15) * 100).toFixed(1));
}

export function calcSquadDepthScore(matches: Match[]): number {
  const contributors = new Set<string>();
  matches.forEach((m) => {
    m.playerPerformances.forEach((p) => {
      if (p.goals > 0 || p.assists > 0) contributors.add(p.playerId);
    });
  });
  return parseFloat(Math.min(100, (contributors.size / 18) * 100).toFixed(1));
}

export function calcMatchReadinessScore(
  trainingCondition: number,
  mentalityScore: number,
  formIndex: number,
  avgRatingTrend: number
): number {
  const score =
    trainingCondition * 40 +
    mentalityScore * 30 +
    (formIndex / 100) * 20 +
    (avgRatingTrend / 10) * 10;
  return parseFloat(Math.min(100, score).toFixed(1));
}

export function calcTeamStats(
  matches: Match[],
  players: Player[],
  trainingCondition: number,
  mentalityScore: number
): TeamStats {
  const totalGames = matches.length;
  const wins = matches.filter((m) => m.result === "W").length;
  const draws = matches.filter((m) => m.result === "D").length;
  const losses = matches.filter((m) => m.result === "L").length;
  const winPct = totalGames ? parseFloat(((wins / totalGames) * 100).toFixed(1)) : 0;
  const totalGoals = matches.reduce((a, m) => a + m.goalsFor, 0);
  const receivedGoals = matches.reduce((a, m) => a + m.goalsAgainst, 0);
  const lostPoints = draws * 2 + losses * 3;
  const cleanSheets = matches.filter((m) => m.goalsAgainst === 0).length;

  const avgRatingHistory = matches.map((m, i) => {
    const perfs = m.playerPerformances;
    const avg = perfs.length
      ? parseFloat((perfs.reduce((a, p) => a + p.rating, 0) / perfs.length).toFixed(2))
      : 0;
    return { match: `G${i + 1} vs ${m.opponent}`, avg };
  });

  const formIndex = calcFormIndex(matches);
  const squadDepthScore = calcSquadDepthScore(matches);

  const last3 = avgRatingHistory.slice(-3);
  const avgRatingTrend = last3.length
    ? last3.reduce((a, m) => a + m.avg, 0) / last3.length
    : 5;

  const matchReadinessScore = calcMatchReadinessScore(
    trainingCondition, mentalityScore, formIndex, avgRatingTrend
  );

  return {
    totalGames, wins, draws, losses, winPct,
    totalGoals, receivedGoals, currentPosition: 1,
    lostPoints, avgRatingHistory, formIndex, squadDepthScore,
    cleanSheets,
    matchReadinessScore, trainingCondition, mentalityScore,
  };
}

// ─── Player Readiness Score (PRS) ────────────────────────────────
export function calcPRS(log: PlayerSessionLog, position: string): number {
  const w = POS_WEIGHTS[position] ?? POS_WEIGHTS.MID;
  const base =
    (log.workRate          * w.workRate +
     log.technicalQuality  * w.technicalQuality +
     log.tacticalAwareness * w.tacticalAwareness +
     log.focusLevel        * w.focusLevel +
     log.coachability      * w.coachability) / 10;

  const fatiguePenalty   = (log.fatigueLevel / 10) * 0.10;
  const injuryPenalty    = log.injuryFlag ? 0.15 : 0;
  const participationMod = log.minutesParticipated < 45 ? -0.05 : 0;

  return parseFloat(
    Math.max(0, Math.min(1, base - fatiguePenalty - injuryPenalty + participationMod)).toFixed(3)
  );
}

export function prsLabel(prs: number): "match_ready" | "monitor" | "rest" {
  if (prs >= 0.75) return "match_ready";
  if (prs >= 0.50) return "monitor";
  return "rest";
}

// ─── Session Team Training Condition ─────────────────────────────
export function calcSessionTC(session: {
  intensity: number; quality: number; attendancePct: number; fatigue: number;
}): number {
  const raw =
    (session.intensity             * 0.25 +
     session.quality               * 0.35 +
     (session.attendancePct / 10)  * 0.30 -
     session.fatigue               * 0.10) / 10;
  return parseFloat(Math.max(0, Math.min(1, raw)).toFixed(3));
}

// ─── Session Mentality Score (from player logs) ───────────────────
export function calcSessionMS(playerLogs: PlayerSessionLog[]): number {
  if (!playerLogs.length) return 0.5;
  const avgBodyLanguage = playerLogs.reduce((a, p) => a + p.bodyLanguage, 0) / playerLogs.length;
  const avgFocus        = playerLogs.reduce((a, p) => a + p.focusLevel, 0)   / playerLogs.length;
  const avgCoachability = playerLogs.reduce((a, p) => a + p.coachability, 0) / playerLogs.length;
  const negativeCount   = playerLogs.filter(
    (p) => p.emotionalState === "frustrated" || p.emotionalState === "anxious"
  ).length;
  const conflictPenalty = (negativeCount / Math.max(playerLogs.length, 1)) * 2;
  const raw =
    (avgBodyLanguage * 0.35 + avgFocus * 0.30 + avgCoachability * 0.25 - conflictPenalty * 0.10) / 10;
  return parseFloat(Math.max(0, Math.min(1, raw)).toFixed(3));
}

// ─── Rolling weighted average (recent = heavier) ──────────────────
const ROLLING_WEIGHTS = [0.35, 0.25, 0.20, 0.12, 0.08];

export function rollingAvg(values: number[]): number {
  const last5 = values.slice(-5).reverse();
  let weightedSum = 0, totalWeight = 0;
  last5.forEach((v, i) => {
    const w = ROLLING_WEIGHTS[i] ?? 0.05;
    weightedSum += v * w;
    totalWeight += w;
  });
  return totalWeight ? parseFloat((weightedSum / totalWeight).toFixed(3)) : 0;
}

export function calcRollingTeamCondition(sessions: TrainingSession[]): { tc: number; ms: number } {
  if (!sessions.length) return { tc: 0.75, ms: 0.70 };
  return {
    tc: rollingAvg(sessions.map((s) => s.teamTC)),
    ms: rollingAvg(sessions.map((s) => s.teamMS)),
  };
}

// ─── Player week summaries (Top 5 widget) ────────────────────────
export function calcPlayerWeekSummaries(
  sessions: TrainingSession[],
  players: Player[]
): PlayerWeekSummary[] {
  const playerMap = Object.fromEntries(players.map((p) => [String(p._id), p]));
  const summaryMap: Record<string, { prsHistory: number[]; injuryFlagged: boolean; sessionCount: number }> = {};

  sessions.forEach((session) => {
    session.playerLogs.forEach((log) => {
      const pid = String(log.playerId);
      if (!summaryMap[pid]) summaryMap[pid] = { prsHistory: [], injuryFlagged: false, sessionCount: 0 };
      summaryMap[pid].prsHistory.push(log.prs);
      summaryMap[pid].sessionCount++;
      if (log.injuryFlag) summaryMap[pid].injuryFlagged = true;
    });
  });

  return Object.entries(summaryMap)
    .map(([pid, data]) => {
      const player = playerMap[pid];
      if (!player) return null;

      const avgPRS = data.prsHistory.length
        ? parseFloat((data.prsHistory.reduce((a, b) => a + b, 0) / data.prsHistory.length).toFixed(3))
        : 0;

      const recent  = data.prsHistory.slice(-3);
      const previous = data.prsHistory.slice(-6, -3);
      const recentAvg = recent.length   ? recent.reduce((a, b) => a + b, 0) / recent.length   : avgPRS;
      const prevAvg   = previous.length ? previous.reduce((a, b) => a + b, 0) / previous.length : avgPRS;
      const trend = parseFloat((recentAvg - prevAvg).toFixed(3));

      const lastLog = sessions[sessions.length - 1]?.playerLogs.find(
        (l) => String(l.playerId) === pid
      );
      let bestMetric = "Consistency";
      if (lastLog) {
        const metrics = [
          { label: "Work Rate",    val: lastLog.workRate },
          { label: "Technical",    val: lastLog.technicalQuality },
          { label: "Tactical",     val: lastLog.tacticalAwareness },
          { label: "Focus",        val: lastLog.focusLevel },
          { label: "Coachability", val: lastLog.coachability },
        ];
        bestMetric = metrics.sort((a, b) => b.val - a.val)[0].label;
      }

      return {
        player, avgPRS,
        prsHistory: data.prsHistory.slice(-5),
        trend, bestMetric,
        readinessLabel: prsLabel(avgPRS),
        injuryFlagged: data.injuryFlagged,
        sessionCount: data.sessionCount,
      } as PlayerWeekSummary;
    })
    .filter(Boolean) as PlayerWeekSummary[];
}

// ─── Injury Risk auto-detection ───────────────────────────────────
export function detectInjuryRisk(playerId: string, sessions: TrainingSession[]): boolean {
  const logs = sessions.slice(-3)
    .map((s) => s.playerLogs.find((l) => String(l.playerId) === playerId))
    .filter(Boolean) as PlayerSessionLog[];
  if (logs.length < 2) return false;
  const avgFatigue  = logs.reduce((a, l) => a + l.fatigueLevel, 0) / logs.length;
  const avgBodyLang = logs.reduce((a, l) => a + l.bodyLanguage, 0)  / logs.length;
  return avgFatigue > 7 && avgBodyLang < 5;
}
