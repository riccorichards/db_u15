"use client";
import { Player } from "@/types";
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
} from "lucide-react";

interface Props {
  player: Player;
  avgRating: number;
  consistency: number;
  currentPRS: number;
  developmentArc: string;
  sessionCount: number;
}

const ARC_CONFIG = {
  progressing: {
    label: "Progressing",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    icon: TrendingUp,
  },
  plateauing: {
    label: "Plateauing",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    icon: Minus,
  },
  regressing: {
    label: "Regressing",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    icon: TrendingDown,
  },
  insufficient_data: {
    label: "Not Enough Data",
    color: "text-sky/40",
    bg: "bg-sky/5 border-sky/10",
    icon: Minus,
  },
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
  currentPRS,
  developmentArc,
  sessionCount,
}: Props) {
  const arc =
    ARC_CONFIG[developmentArc as keyof typeof ARC_CONFIG] ??
    ARC_CONFIG.insufficient_data;
  const ArcIcon = arc.icon;
  const prsKey =
    currentPRS >= 0.75
      ? "match_ready"
      : currentPRS >= 0.5
        ? "monitor"
        : currentPRS > 0
          ? "rest"
          : null;
  const prs = prsKey ? PRS_CONFIG[prsKey] : null;

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
        {/* Jersey number watermark */}
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

            {/* Badges */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Development arc */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono ${arc.bg} ${arc.color}`}
              >
                <ArcIcon size={11} />
                {arc.label}
              </div>

              {/* PRS badge */}
              {prs && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass text-xs font-mono">
                  <div className={`w-1.5 h-1.5 rounded-full ${prs.dot}`} />
                  <span className={prs.color}>{prs.label}</span>
                  <span className="text-sky/30">·</span>
                  <span className="text-white">
                    {Math.round(currentPRS * 100)}
                  </span>
                </div>
              )}

              <span className="text-sky/30 text-xs font-mono">
                {sessionCount} training sessions
              </span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
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

        {/* Cards + consistency */}
        <div className="flex items-center gap-4 mt-3">
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
