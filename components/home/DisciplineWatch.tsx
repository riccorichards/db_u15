"use client";
import { DisciplineRanking } from "@/types";
import { ShieldAlert, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";

interface Props {
  rankings: DisciplineRanking[];
}

const EVENT_LABELS: Record<string, string> = {
  yellow_card: "Yellow card",
  red_card: "Red card",
  late_training: "Late to training",
  early_exit: "Left session early",
  low_coachability: "Low coachability",
  repeated_negative_state: "Repeated negative mood",
  full_attendance_week: "Full attendance week",
  high_coachability_streak: "High coachability streak",
};

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 85
      ? "bg-green-500"
      : score >= 70
        ? "bg-ocean"
        : score >= 50
          ? "bg-yellow-500"
          : "bg-red-500";
  return (
    <div className="w-16 h-1.5 bg-navy-800/60 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

export default function DisciplineWatch({ rankings }: Props) {
  if (!rankings.length) return null;

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-sky/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center">
            <ShieldAlert size={15} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Professionalism Watch
            </h3>
            <p className="text-xs text-sky/40 font-body mt-0.5">
              Bottom 5 by discipline score — 28-day rolling window
            </p>
          </div>
        </div>
        <div className="text-[10px] font-mono text-sky/30 text-right">
          <div>100 = perfect</div>
          <div>Cards, tardiness,</div>
          <div>coachability events</div>
        </div>
      </div>

      <div className="divide-y divide-sky/5">
        {rankings.map((r, i) => {
          const scoreColor =
            r.score >= 85
              ? "text-green-400"
              : r.score >= 70
                ? "text-ocean"
                : r.score >= 50
                  ? "text-yellow-400"
                  : "text-red-400";

          return (
            <div
              key={r.playerId}
              className="flex items-center gap-4 px-5 py-3 hover:bg-ocean/5 transition-colors"
            >
              {/* Rank */}
              <div className="w-5 text-center flex-shrink-0">
                <span className="text-sky/30 font-mono text-xs">{i + 1}</span>
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/players/${r.playerId}`}
                  className="text-white font-display font-bold text-sm hover:text-sky transition-colors truncate block"
                >
                  {r.name}
                </Link>
                <p className="text-[10px] text-sky/40 font-body mt-0.5">
                  Professionalism development focus
                </p>
              </div>

              {/* Score bar */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <ScoreBar score={r.score} />
                <span
                  className={`font-display font-black text-lg w-8 text-right ${scoreColor}`}
                >
                  {r.score}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-sky/10 bg-navy-950/20">
        <p className="text-[10px] font-body text-sky/30 leading-relaxed">
          Score starts at 100. Events that reduce it: yellow card (−8), red card
          (−20), late training (−5), early exit (−5), low coachability 3× (−6),
          repeated negative mood (−4). Events that increase it: full attendance
          week (+3), high coachability streak (+2).
        </p>
      </div>
    </div>
  );
}
