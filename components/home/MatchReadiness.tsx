"use client";
import { TeamStats, MPI, TeamCondition } from "@/types";
import {
  Brain,
  Dumbbell,
  Activity,
  TrendingUp,
  Star,
  AlertCircle,
} from "lucide-react";

interface Props {
  stats: TeamStats;
  mpi?: MPI | null;
  sqi?: number | null;
  condition?: TeamCondition | null;
}

function RadialGauge({ value, size = 120 }: { value: number; size?: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const color =
    value >= 75
      ? "#4ade80"
      : value >= 55
        ? "#018ABE"
        : value >= 35
          ? "#facc15"
          : "#f87171";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="rgba(151,202,219,0.1)"
        strokeWidth="8"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 1s ease, stroke 0.3s" }}
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeOpacity="0.3"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        transform="rotate(-90 50 50)"
        filter="blur(3px)"
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dy="0.35em"
        fill="white"
        fontSize="18"
        fontWeight="bold"
        fontFamily="Barlow Condensed"
      >
        {Math.round(value)}
      </text>
    </svg>
  );
}

function ConditionBar({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  hint?: string;
}) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 75
      ? "bg-green-500"
      : pct >= 55
        ? "bg-ocean"
        : pct >= 35
          ? "bg-yellow-500"
          : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-navy-800/60 flex items-center justify-center flex-shrink-0">
        <Icon size={13} className="text-sky" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-sky/70 font-body">{label}</span>
          <span className="text-xs text-white font-mono">{pct}%</span>
        </div>
        <div className="h-1.5 bg-navy-800/40 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} rounded-full transition-all duration-1000`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {hint && (
          <p className="text-[9px] text-sky/30 font-body mt-0.5">{hint}</p>
        )}
      </div>
    </div>
  );
}

export default function MatchReadiness({ stats, mpi, sqi, condition }: Props) {
  const mrs = stats.matchReadinessScore;

  const verdict =
    mrs >= 75
      ? {
          label: "High Readiness",
          desc: "Team is primed to win",
          color: "text-green-400",
        }
      : mrs >= 55
        ? {
            label: "Moderate",
            desc: "Competitive performance likely",
            color: "text-ocean",
          }
        : mrs >= 35
          ? {
              label: "Caution",
              desc: "Performance may be inconsistent",
              color: "text-yellow-400",
            }
          : {
              label: "Low Readiness",
              desc: "Team needs recovery",
              color: "text-red-400",
            };

  const isLimitedData =
    condition?.formulaVersion === 1 && (condition?.sessionCount ?? 0) < 3;

  const mpiTrend = mpi?.trendDelta ?? 0;
  const mpiColor =
    mpiTrend > 0.3
      ? "text-green-400"
      : mpiTrend < -0.3
        ? "text-red-400"
        : "text-sky/60";

  return (
    <div className="glass rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
            Match Readiness
          </h3>
          <p className="text-xs text-sky/50 font-body mt-0.5">
            Pre-match prediction score
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div
            className={`glass rounded-xl px-3 py-1 text-xs font-display font-bold uppercase ${verdict.color}`}
          >
            {verdict.label}
          </div>
          {isLimitedData && (
            <div className="flex items-center gap-1 text-[9px] font-mono text-yellow-400/70">
              <AlertCircle size={9} /> Limited data — v1 formula
            </div>
          )}
        </div>
      </div>

      {/* Gauge + verdict */}
      <div className="flex items-center gap-4 mb-5">
        <RadialGauge value={mrs} size={96} />
        <div className="flex-1">
          <p className={`font-display text-sm font-bold ${verdict.color}`}>
            {verdict.desc}
          </p>
          <p className="text-[9px] font-mono text-sky/40 mt-1 leading-relaxed">
            TC×40 + MS×25 + Form×20 + MPI×10 + SQI×10
          </p>

          {/* MPI inline */}
          {mpi && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-mono text-sky/40">MPI</span>
              <span className="text-xs font-mono text-white font-bold">
                {mpi.mpi.toFixed(1)}
              </span>
              <span className={`text-[10px] font-mono ${mpiColor}`}>
                {mpiTrend >= 0 ? "↑" : "↓"}
                {Math.abs(mpiTrend).toFixed(2)} trend
              </span>
            </div>
          )}

          {/* SQI inline */}
          {sqi != null && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-sky/40">SQI</span>
              <span className="text-xs font-mono text-white font-bold">
                {Math.round(sqi * 100)}%
              </span>
              <span className="text-[9px] font-mono text-sky/30">
                squad quality
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Condition bars */}
      <div className="space-y-3 flex-1">
        <ConditionBar
          label="Training Condition"
          value={stats.trainingCondition}
          icon={Dumbbell}
          hint={
            isLimitedData
              ? "Baseline formula — add pillar data to activate v2"
              : undefined
          }
        />
        <ConditionBar
          label="Mentality Score"
          value={stats.mentalityScore}
          icon={Brain}
        />
        <ConditionBar
          label="Form Index"
          value={stats.formIndex / 100}
          icon={Activity}
          hint="Difficulty-adjusted when OSI data available"
        />

        {/* MPI bar */}
        {mpi && (
          <ConditionBar
            label="Match Performance Index"
            value={mpi.mpi / 10}
            icon={TrendingUp}
            hint={`Season ${mpi.seasonAvg.toFixed(1)} · Last 3: ${mpi.last3Avg.toFixed(1)}`}
          />
        )}

        {/* SQI bar */}
        {sqi != null && (
          <ConditionBar
            label="Squad Quality Index"
            value={sqi}
            icon={Star}
            hint="Average pillar overall of registered players"
          />
        )}
      </div>

      {/* Squad depth footer */}
      <div className="mt-4 pt-3 border-t border-sky/10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-sky/50 font-body">
            Squad Depth Score
          </span>
          <span className="text-xs font-mono text-white">
            {stats.squadDepthScore}%
          </span>
        </div>
        <div className="text-xs text-sky/40 mt-1 font-body">
          % of squad with at least one goal or assist
        </div>
      </div>
    </div>
  );
}
