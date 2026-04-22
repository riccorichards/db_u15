"use client";
import { PlayerWeekSummary } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Star,
} from "lucide-react";
import Image from "next/image";
import { getPlayerImage } from "@/lib/playerImages";

import Link from "next/link";

interface Props {
  summaries: PlayerWeekSummary[];
}

const READINESS_CONFIG = {
  match_ready: {
    label: "Match Ready",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    dot: "bg-green-400",
  },
  monitor: {
    label: "Monitor",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    dot: "bg-yellow-400",
  },
  rest: {
    label: "Rest",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    dot: "bg-red-400",
  },
};

function MiniSparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 0.1);
  const min = Math.min(...values);
  const range = max - min || 0.1;
  const w = 48,
    h = 20;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  const trend = values[values.length - 1] - values[0];
  const stroke = trend > 0 ? "#4ade80" : trend < 0 ? "#f87171" : "#97CADB";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={(i / (values.length - 1)) * w}
          cy={h - ((v - min) / range) * h}
          r="2"
          fill={stroke}
        />
      ))}
    </svg>
  );
}

function TrendBadge({ trend }: { trend: number }) {
  const pct = Math.round(trend * 100);
  if (Math.abs(pct) < 1) return <Minus size={12} className="text-sky/40" />;
  if (trend > 0)
    return (
      <span className="flex items-center gap-0.5 text-green-400 text-xs font-mono">
        <TrendingUp size={11} />+{pct}%
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-red-400 text-xs font-mono">
      <TrendingDown size={11} />
      {pct}%
    </span>
  );
}

export default function Top5Widget({ summaries }: Props) {
  // Sort by avgPRS descending, take top 5
  const top5 = [...summaries].sort((a, b) => b.avgPRS - a.avgPRS).slice(0, 5);

  // Most improved = biggest positive trend
  const mostImproved = [...summaries].sort((a, b) => b.trend - a.trend)[0];

  if (!top5.length) {
    return (
      <div className="glass rounded-2xl p-5 h-full flex flex-col items-center justify-center gap-2">
        <Star size={28} className="text-sky/20" />
        <p className="text-sky/40 text-sm font-body text-center">
          No training sessions yet.
          <br />
          Log a session to see weekly rankings.
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
            Week&apos;s Best
          </h3>
          <p className="text-xs text-sky/40 font-body mt-0.5">
            Top players by readiness score
          </p>
        </div>
        <div className="glass rounded-xl px-2.5 py-1 flex items-center gap-1.5">
          <Star size={11} className="text-yellow-400" />
          <span className="text-xs font-mono text-sky/60">Last 7 days</span>
        </div>
      </div>

      {/* Top 5 list */}
      <div className="space-y-2 mb-4">
        {top5.map((summary, i) => {
          const cfg = READINESS_CONFIG[summary.readinessLabel];
          return (
            <Link
              href={`/players/${summary.player._id}`}
              key={summary.player._id}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                i === 0 ? "glass-bright border border-ocean/20" : "glass"
              }`}
            >
              {/* Rank */}
              <div className="w-5 text-center flex-shrink-0">
                {i === 0 ? (
                  <Star size={14} className="text-yellow-400 mx-auto" />
                ) : (
                  <span className="text-sky/30 font-mono text-xs">{i + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-navy-800/60 flex-shrink-0 border border-sky/10">
                <Image
                  src={getPlayerImage(summary.player.avatarKey)}
                  alt={summary.player.name}
                  fill
                  sizes="32px"
                  className="object-cover object-top"
                  quality={90}
                />
              </div>

              {/* Name + badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-display font-bold text-sm truncate">
                    {summary.player.name} {summary.player.surname}
                  </span>
                  {summary.injuryFlagged && (
                    <AlertTriangle
                      size={11}
                      className="text-red-400 flex-shrink-0"
                    />
                  )}
                  {summary.player._id === mostImproved?.player._id &&
                    summary.trend > 0 && (
                      <span className="text-[9px] font-mono bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 flex-shrink-0">
                        ↑ IMPROVED
                      </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[9px] px-1 rounded font-mono pos-${summary.player.position}`}
                  >
                    {summary.player.position}
                  </span>
                  <span className="text-[10px] text-sky/40 font-body">
                    Best: {summary.bestMetric}
                  </span>
                  <span className="text-[10px] text-sky/30 font-mono">
                    {summary.sessionCount} sessions
                  </span>
                </div>
              </div>

              {/* Sparkline */}
              <div className="hidden md:block flex-shrink-0">
                <MiniSparkline values={summary.prsHistory} />
              </div>

              {/* PRS + trend */}
              <div className="flex-shrink-0 text-right">
                <div className="font-display font-black text-lg text-white">
                  {Math.round(summary.avgPRS * 100)}
                </div>
                <div className="flex items-center justify-end">
                  <TrendBadge trend={summary.trend} />
                </div>
              </div>

              {/* Readiness dot */}
              <div className="flex-shrink-0">
                <div
                  className={`w-2 h-2 rounded-full ${cfg.dot}`}
                  title={cfg.label}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-sky/10 flex items-center gap-4">
        {Object.entries(READINESS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            <span className="text-[10px] font-mono text-sky/40">
              {cfg.label}
            </span>
          </div>
        ))}
        <span className="ml-auto text-[10px] font-mono text-sky/30">
          Score = PRS × 100
        </span>
      </div>
    </div>
  );
}
