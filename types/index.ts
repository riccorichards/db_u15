export interface Player {
  _id?: string;
  name: string;
  surname: string;
  number: number;
  position: "GK" | "DEF" | "MID" | "FWD";
  avatarKey: string;
  gamesPlayed: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  mvpCount: number;
  yellowCards: number;
  redCards: number;
  ratings: number[]; // per-game ratings
  cleanSheets?: number; // GK only
  createdAt?: string;
}

export interface Match {
  _id?: string;
  date: string;
  opponent: string;
  homeAway: "home" | "away";
  goalsFor: number;
  goalsAgainst: number;
  result: "W" | "D" | "L";
  trainingCondition: number; // 0–1 before match
  mentalityScore: number; // 0–1 before match
  playerPerformances: {
    playerId: string;
    minutesPlayed: number;
    goals: number;
    assists: number;
    rating: number; // 1–10
    isMvp: boolean;
    yellowCard: boolean;
    redCard: boolean;
  }[];
  createdAt?: string;
}

export interface TeamCondition {
  _id?: string;
  date: string;
  trainingCondition: number; // 0–1
  mentalityScore: number; // 0–1
  notes?: string;
}

export interface TeamStats {
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  winPct: number;
  totalGoals: number;
  receivedGoals: number;
  currentPosition: number;
  lostPoints: number;
  avgRatingHistory: { match: string; avg: number }[];
  formIndex: number;
  squadDepthScore: number;
  matchReadinessScore: number;
  cleanSheets: number;
  trainingCondition: number;
  mentalityScore: number;
}

// ─── Training System ──────────────────────────────────────────────

export type EmotionalState =
  | "happy"
  | "neutral"
  | "tired"
  | "frustrated"
  | "anxious";
export type SessionType =
  | "tactical"
  | "physical"
  | "technical"
  | "mixed"
  | "recovery";

export interface TrainingSession {
  _id?: string;
  date: string;
  sessionType: SessionType;
  // Coach-level inputs
  intensity: number; // 1–10
  quality: number; // 1–10
  attendancePct: number; // 0–100
  fatigue: number; // 1–10 (inverse — high = bad)
  coachRating: number; // 1–10 overall session feel
  notes?: string;
  // Computed (stored for history)
  teamTC: number; // 0–1 team training condition
  teamMS: number; // 0–1 team mentality score
  playerLogs: PlayerSessionLog[];
  createdAt?: string;
}

export interface PlayerSessionLog {
  playerId: string;
  // Physical
  workRate: number; // 1–10
  technicalQuality: number; // 1–10
  tacticalAwareness: number; // 1–10
  // Mental
  focusLevel: number; // 1–10
  bodyLanguage: number; // 1–10
  coachability: number; // 1–10
  emotionalState: EmotionalState;
  // Condition
  fatigueLevel: number; // 1–10 (inverse)
  injuryFlag: boolean;
  minutesParticipated: number;
  // Computed
  prs: number; // 0–1 Player Readiness Score
  readinessLabel: "match_ready" | "monitor" | "rest";
}

export interface PlayerWeekSummary {
  player: Player;
  avgPRS: number;
  prsHistory: number[]; // last 5 sessions
  trend: number; // delta vs previous week avg
  bestMetric: string;
  readinessLabel: "match_ready" | "monitor" | "rest";
  injuryFlagged: boolean;
  sessionCount: number;
}
