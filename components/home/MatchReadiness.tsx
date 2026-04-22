"use client";
import { TeamStats } from "@/types";
import { Brain, Dumbbell, Activity } from "lucide-react";

interface Props {
  stats: TeamStats;
}

function RadialGauge({ value, size = 120 }: { value: number; size?: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 100) * circumference;
  const color =
    value >= 75 ? "#4ade80" : value >= 50 ? "#018ABE" : value >= 30 ? "#facc15" : "#f87171";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {/* Track */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="rgba(151,202,219,0.1)"
        strokeWidth="8"
      />
      {/* Progress */}
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
      {/* Glow */}
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
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-ocean" : pct >= 30 ? "bg-yellow-500" : "bg-red-500";

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
      </div>
    </div>
  );
}

export default function MatchReadiness({ stats }: Props) {
  const mrs = stats.matchReadinessScore;
  const verdict =
    mrs >= 75
      ? { label: "High Readiness", desc: "Team is primed to win", color: "text-green-400" }
      : mrs >= 55
      ? { label: "Moderate", desc: "Competitive performance likely", color: "text-ocean" }
      : mrs >= 35
      ? { label: "Caution", desc: "Performance may be inconsistent", color: "text-yellow-400" }
      : { label: "Low Readiness", desc: "Team needs recovery", color: "text-red-400" };

  return (
    <div className="glass rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
            Match Readiness
          </h3>
          <p className="text-xs text-sky/50 font-body mt-0.5">Pre-match prediction score</p>
        </div>
        <div className="glass rounded-xl px-3 py-1">
          <span className={`text-xs font-display font-bold uppercase ${verdict.color}`}>
            {verdict.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-5 mb-5">
        <RadialGauge value={mrs} size={100} />
        <div>
          <p className={`font-display text-base font-bold ${verdict.color}`}>{verdict.desc}</p>
          <p className="text-xs text-mist/50 font-mono mt-1">
            MRS = Training×0.4 + Mentality×0.3 + Form×0.2 + Rating×0.1
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <ConditionBar
          label="Training Condition"
          value={stats.trainingCondition}
          icon={Dumbbell}
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
        />
      </div>

      <div className="mt-4 pt-3 border-t border-sky/10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-sky/50 font-body">Squad Depth Score</span>
          <span className="text-xs font-mono text-white">{stats.squadDepthScore}%</span>
        </div>
        <div className="text-xs text-sky/40 mt-1 font-body">
          % of squad with goal/assist contributions
        </div>
      </div>
    </div>
  );
}
