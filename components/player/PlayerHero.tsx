"use client";
import { Player, DevelopmentArc, ProductionProfile } from "@/types";
import { getPlayerImage } from "@/lib/playerImages";
import Image from "next/image";
import {
  Star,
  Target,
  Zap,
  Clock,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Activity,
  UserCheck,
} from "lucide-react";

interface Props {
  player: Player;
  avgRating: number;
  consistency: number;
  rollingPRS: number | null;
  rollingPRSLabel: "match_ready" | "monitor" | "rest" | null;
  developmentArc: DevelopmentArc;
  sessionCount: number;
  productionProfile: ProductionProfile;
  attendanceRate: number;
  disciplineScore: number;
  injuryRisk: boolean;
}

const ARC_CONFIG = {
  progressing: {
    label: "Progressing",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    Icon: TrendingUp,
  },
  plateauing: {
    label: "Plateauing",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    Icon: Minus,
  },
  regressing: {
    label: "Regressing",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    Icon: TrendingDown,
  },
  insufficient_data: {
    label: "Insufficient Data",
    color: "text-sky/40",
    bg: "bg-sky/5 border-sky/10",
    Icon: Minus,
  },
};

const CONFIDENCE_COLORS = {
  none: "text-sky/30",
  low: "text-yellow-400/70",
  medium: "text-ocean/80",
  high: "text-green-400/80",
};

const PRS_CONFIG = {
  match_ready: {
    label: "Match Ready",
    color: "text-green-400",
    dot: "bg-green-400",
  },
  monitor: { label: "Monitor", color: "text-yellow-400", dot: "bg-yellow-400" },
  rest: { label: "Rest", color: "text-red-400", dot: "bg-red-400" },
};

const ratingColor = (r: number) =>
  r >= 8
    ? "text-green-400"
    : r >= 6.5
      ? "text-ocean"
      : r >= 5
        ? "text-yellow-400"
        : r > 0
          ? "text-red-400"
          : "text-sky/30";

export default function PlayerHero({
  player,
  avgRating,
  consistency,
  rollingPRS,
  rollingPRSLabel,
  developmentArc,
  sessionCount,
  productionProfile,
  attendanceRate,
  disciplineScore,
  injuryRisk,
}: Props) {
  const arc = ARC_CONFIG[developmentArc.arc] ?? ARC_CONFIG.insufficient_data;
  const ArcIcon = arc.Icon;
  const prs = rollingPRSLabel ? PRS_CONFIG[rollingPRSLabel] : null;

  const disciplineColor =
    disciplineScore >= 85
      ? "text-green-400"
      : disciplineScore >= 70
        ? "text-ocean"
        : disciplineScore >= 50
          ? "text-yellow-400"
          : "text-red-400";

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Banner */}
      <div className="h-24 bg-pitch-gradient relative">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #018ABE 0, #018ABE 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 font-display font-black text-8xl text-white/10 select-none">
          {player.number}
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Avatar + identity */}
        <div className="flex items-end gap-5 -mt-10 mb-5">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-ocean/40 bg-navy-800 flex-shrink-0 shadow-xl">
            <Image
              src={getPlayerImage(player.avatarKey)}
              alt={`${player.name} ${player.surname}`}
              fill
              sizes="80px"
              className="object-cover object-top"
              quality={95}
            />
            {injuryRisk && (
              <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 flex items-center justify-center py-0.5">
                <AlertTriangle size={10} className="text-white" />
              </div>
            )}
          </div>
          <div className="pb-1 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-3xl font-black text-white uppercase tracking-wide">
                {player.name} {player.surname}
              </h1>
              <span
                className={`px-2 py-0.5 rounded-lg text-sm font-mono pos-${player.position}`}
              >
                {player.position}
              </span>
              <span className="text-sky/40 font-mono text-sm">
                #{player.number}
              </span>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Development arc */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono ${arc.bg} ${arc.color}`}
              >
                <ArcIcon size={11} />
                {arc.label}
                {developmentArc.confidence !== "none" && (
                  <span
                    className={`text-[9px] ml-1 ${CONFIDENCE_COLORS[developmentArc.confidence]}`}
                  >
                    ({developmentArc.confidence} confidence ·{" "}
                    {developmentArc.sessionCount} sessions)
                  </span>
                )}
              </div>

              {/* Rolling PRS badge */}
              {prs && rollingPRS !== null && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass text-xs font-mono">
                  <div className={`w-1.5 h-1.5 rounded-full ${prs.dot}`} />
                  <span className={prs.color}>{prs.label}</span>
                  <span className="text-sky/30">·</span>
                  <span className="text-white">
                    {Math.round(rollingPRS * 100)}
                  </span>
                  <span className="text-[9px] text-sky/30 ml-0.5">
                    3-session avg
                  </span>
                </div>
              )}

              {injuryRisk && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-xs font-mono text-red-400">
                  <AlertTriangle size={11} />
                  Injury Risk Detected
                </div>
              )}

              <span className="text-sky/30 text-xs font-mono">
                {sessionCount} training sessions
              </span>
            </div>
          </div>
        </div>

        {/* Arc deltas */}
        {developmentArc.confidence !== "none" && (
          <div className="flex items-center gap-4 mb-4 p-3 glass rounded-xl border border-sky/5">
            <div className="text-[10px] font-mono text-sky/40 uppercase tracking-wider">
              Arc signals
            </div>
            {[
              {
                label: "Short-term",
                val: developmentArc.shortTerm,
                desc: "Last 3 vs prior 3 sessions",
              },
              {
                label: "Mid-term",
                val: developmentArc.midTerm,
                desc: "Last 5 vs first 5 sessions",
              },
              {
                label: "Season slope",
                val: developmentArc.seasonSlope,
                desc: "Linear regression across all PRS",
                scale: 100,
              },
            ].map(({ label, val, desc, scale = 1 }) => {
              const display = (val * scale).toFixed(scale === 100 ? 3 : 2);
              const isPos = val > 0;
              const isFlat = Math.abs(val) < 0.01;
              return (
                <div key={label} className="flex-1 text-center">
                  <div
                    className={`font-mono text-sm font-bold ${
                      isFlat
                        ? "text-sky/40"
                        : isPos
                          ? "text-green-400"
                          : "text-red-400"
                    }`}
                  >
                    {isPos ? "+" : ""}
                    {display}
                  </div>
                  <div className="text-[9px] font-mono text-sky/40 mt-0.5">
                    {label}
                  </div>
                  <div className="text-[8px] text-sky/25 font-body">{desc}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          {[
            {
              label: "Games",
              value: player.gamesPlayed,
              icon: Shield,
              color: "text-white",
            },
            {
              label: "Minutes",
              value: `${player.minutesPlayed}'`,
              icon: Clock,
              color: "text-mist/70",
            },
            {
              label: "Goals",
              value: player.goals,
              icon: Target,
              color: "text-white",
            },
            {
              label: "Assists",
              value: player.assists,
              icon: Zap,
              color: "text-white",
            },
            {
              label: "MVP",
              value: player.mvpCount,
              icon: Star,
              color: "text-yellow-400",
            },
            {
              label: "Avg RTG",
              value: avgRating > 0 ? avgRating.toFixed(1) : "—",
              icon: TrendingUp,
              color: ratingColor(avgRating),
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass rounded-xl p-3 text-center">
              <Icon size={14} className="text-sky/40 mx-auto mb-1" />
              <div className={`font-display text-xl font-black ${color}`}>
                {value}
              </div>
              <div className="text-[10px] font-mono text-sky/40 uppercase">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Production profile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            {
              label: "Goals/80",
              value: productionProfile.goalsPer80.toFixed(2),
              color: "text-green-400",
              hint: "Goals per 80 min",
            },
            {
              label: "Assists/80",
              value: productionProfile.assistsPer80.toFixed(2),
              color: "text-ocean",
              hint: "Assists per 80 min",
            },
            {
              label: "G+A/80",
              value: productionProfile.goalInvolvementPer80.toFixed(2),
              color: "text-sky",
              hint: "Goal involvement",
            },
            {
              label: "Win Rate",
              value: `${productionProfile.matchWinRate.toFixed(0)}%`,
              color: "text-purple-400",
              hint: "When this player plays",
            },
          ].map(({ label, value, color, hint }) => (
            <div
              key={label}
              className="glass-bright rounded-xl p-3 text-center border border-sky/10"
            >
              <div className="text-[9px] font-mono text-sky/40 uppercase mb-1">
                {hint}
              </div>
              <div className={`font-display text-lg font-black ${color}`}>
                {value}
              </div>
              <div className="text-[10px] font-mono text-sky/50 mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Footer row: consistency, attendance, discipline, cards */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-sky/10">
          {player.yellowCards > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-yellow-400">
              <div className="w-3 h-4 bg-yellow-400 rounded-sm" />
              {player.yellowCards} yellow
            </div>
          )}
          {player.redCards > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-red-400">
              <div className="w-3 h-4 bg-red-400 rounded-sm" />
              {player.redCards} red
            </div>
          )}

          {/* Attendance */}
          <div className="flex items-center gap-2">
            <UserCheck size={12} className="text-sky/40" />
            <span className="text-xs text-sky/40 font-body">Attendance</span>
            <span className="text-xs font-mono text-white">
              {attendanceRate.toFixed(0)}%
            </span>
          </div>

          {/* Discipline */}
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-sky/40" />
            <span className="text-xs text-sky/40 font-body">Discipline</span>
            <span className={`text-xs font-mono font-bold ${disciplineColor}`}>
              {disciplineScore}/100
            </span>
          </div>

          {/* Consistency */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-sky/40 font-body">Consistency</span>
            <div className="w-24 h-1.5 bg-navy-800/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-ocean rounded-full"
                style={{ width: `${consistency}%` }}
              />
            </div>
            <span className="text-xs font-mono text-white">{consistency}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
