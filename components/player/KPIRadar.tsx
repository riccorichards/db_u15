"use client";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Target, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { KPITargets, KPIProgress } from "@/types";

interface KPIProgressData {
  targets: KPITargets;
  progress: KPIProgress[];
  currentValues: Record<string, number>;
  weeksElapsed: number;
  weeksRemaining: number;
}

interface Props {
  kpiProgress: KPIProgressData | null;
}

const METRIC_LABELS: Record<string, string> = {
  prsAvg: "PRS Avg",
  goals: "Goals",
  avgRating: "Rating",
  attendanceRate: "Attend.",
  consistencyScore: "Consist.",
  disciplineScore: "Discipline",
  pillarOverall: "Pillar",
};

const METRIC_COLORS: Record<string, string> = {
  prsAvg: "#018ABE",
  goals: "#4ade80",
  avgRating: "#facc15",
  attendanceRate: "#a78bfa",
  consistencyScore: "#818cf8",
  disciplineScore: "#f87171",
  pillarOverall: "#34d399",
};

export default function KPIRadar({ kpiProgress }: Props) {
  if (!kpiProgress || kpiProgress.progress.length === 0) {
    return (
      <div className="glass rounded-2xl p-5 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-yellow-500/15 flex items-center justify-center">
            <Target size={15} className="text-yellow-400" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Season KPI Progress
            </h3>
            <p className="text-xs text-sky/40 font-body mt-0.5">
              Target vs actual radar
            </p>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center">
            <Target size={22} className="text-sky/20" />
          </div>
          <div className="text-center">
            <p className="text-white font-display font-bold text-sm">
              No KPI Targets Set
            </p>
            <p className="text-sky/40 text-xs font-body mt-1">
              Set season targets in Admin → KPI Targets to track this player's
              development goals
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { progress, weeksElapsed, weeksRemaining } = kpiProgress;

  // Normalize all values to 0–100 for the radar
  const chartData = progress.map((item) => ({
    metric: METRIC_LABELS[item.metric] ?? item.metric,
    rawMetric: item.metric,
    target: 100, // always 100% — the outer ring is the target
    current: Math.min(100, item.pct),
    projected: Math.min(100, (item.projected / item.target) * 100),
  }));

  // Overall completion
  const avgCompletion =
    progress.reduce((a, b) => a + Math.min(100, b.pct), 0) / progress.length;

  return (
    <div className="glass rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-yellow-500/15 flex items-center justify-center">
            <Target size={15} className="text-yellow-400" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
              Season KPI Progress
            </h3>
            <p className="text-xs text-sky/40 font-body mt-0.5">
              Week {weeksElapsed} · {weeksRemaining} weeks remaining
            </p>
          </div>
        </div>
        <div className="text-right">
          <div
            className={`font-display text-2xl font-black ${
              avgCompletion >= 80
                ? "text-green-400"
                : avgCompletion >= 50
                  ? "text-ocean"
                  : "text-yellow-400"
            }`}
          >
            {Math.round(avgCompletion)}%
          </div>
          <div className="text-[10px] font-mono text-sky/40">
            AVG COMPLETION
          </div>
        </div>
      </div>

      {/* Radar */}
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="rgba(151,202,219,0.1)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{
              fill: "rgba(151,202,219,0.7)",
              fontSize: 10,
              fontFamily: "JetBrains Mono",
            }}
          />
          {/* Target ring */}
          <Radar
            name="Target"
            dataKey="target"
            stroke="rgba(151,202,219,0.25)"
            fill="rgba(151,202,219,0.04)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          {/* Projected */}
          <Radar
            name="Projected"
            dataKey="projected"
            stroke="rgba(250,204,21,0.4)"
            fill="rgba(250,204,21,0.05)"
            strokeWidth={1}
            strokeDasharray="2 2"
          />
          {/* Current */}
          <Radar
            name="Current"
            dataKey="current"
            stroke="#018ABE"
            fill="rgba(1,138,190,0.2)"
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(0,27,72,0.95)",
              border: "1px solid rgba(151,202,219,0.2)",
              borderRadius: "12px",
              fontSize: "11px",
              fontFamily: "JetBrains Mono",
            }}
            formatter={(value: number, name: string) => [
              `${Math.round(value)}% of target`,
              name,
            ]}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Progress rows */}
      <div className="space-y-2 mt-2 flex-1">
        {progress.map((item) => {
          const pct = Math.min(100, item.pct);
          const onTrack = item.projected >= item.target * 0.95;
          const TrendIcon =
            item.projected > item.current
              ? TrendingUp
              : item.projected < item.current
                ? TrendingDown
                : Minus;
          const trendColor = onTrack ? "text-green-400" : "text-yellow-400";

          return (
            <div key={item.metric} className="flex items-center gap-3">
              <div className="w-16 flex-shrink-0">
                <span className="text-[9px] font-mono text-sky/50 uppercase">
                  {METRIC_LABELS[item.metric] ?? item.metric}
                </span>
              </div>
              <div className="flex-1 h-1.5 bg-navy-800/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: METRIC_COLORS[item.metric] ?? "#018ABE",
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-white w-8 text-right">
                {pct.toFixed(0)}%
              </span>
              <div className="flex items-center gap-0.5 w-14 text-right">
                <TrendIcon size={9} className={trendColor} />
                <span className={`text-[9px] font-mono ${trendColor}`}>
                  {item.projected.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-sky/10">
        {[
          { color: "#018ABE", label: "Current", dash: false },
          { color: "rgba(250,204,21,0.6)", label: "Projected", dash: true },
          { color: "rgba(151,202,219,0.3)", label: "Target", dash: true },
        ].map(({ color, label, dash }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className="w-4 h-0.5"
              style={{
                background: dash ? "transparent" : color,
                borderTop: dash ? `1px dashed ${color}` : "none",
              }}
            />
            <span className="text-[10px] font-mono text-sky/40">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
