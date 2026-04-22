"use client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

interface RadarData {
  workRate: number;
  technicalQuality: number;
  tacticalAwareness: number;
  focusLevel: number;
  bodyLanguage: number;
  coachability: number;
}

interface Props {
  radarData: RadarData | null;
  position: string;
}

// Position average benchmarks
const POS_BENCHMARKS: Record<string, RadarData> = {
  GK:  { workRate: 6.5, technicalQuality: 6.0, tacticalAwareness: 7.5, focusLevel: 7.5, bodyLanguage: 7.0, coachability: 7.0 },
  DEF: { workRate: 7.0, technicalQuality: 6.5, tacticalAwareness: 7.5, focusLevel: 7.0, bodyLanguage: 6.5, coachability: 7.0 },
  MID: { workRate: 7.5, technicalQuality: 7.5, tacticalAwareness: 7.0, focusLevel: 7.0, bodyLanguage: 6.5, coachability: 7.0 },
  FWD: { workRate: 7.5, technicalQuality: 8.0, tacticalAwareness: 6.5, focusLevel: 7.0, bodyLanguage: 6.5, coachability: 6.5 },
};

const METRIC_LABELS: Record<string, string> = {
  workRate:          "Work Rate",
  technicalQuality:  "Technical",
  tacticalAwareness: "Tactical",
  focusLevel:        "Focus",
  bodyLanguage:      "Body Lang.",
  coachability:      "Coachability",
};

const METRIC_DESCRIPTIONS: Record<string, string> = {
  workRate:          "Effort and running intensity during sessions",
  technicalQuality:  "Ball control, passing and finishing execution",
  tacticalAwareness: "Positioning, pressing triggers and shape",
  focusLevel:        "Concentration and listening to instructions",
  bodyLanguage:      "Positive signals and leadership presence",
  coachability:      "Response quality to feedback and corrections",
};

export default function PlayerRadarChart({ radarData, position }: Props) {
  const benchmark = POS_BENCHMARKS[position] ?? POS_BENCHMARKS.MID;

  if (!radarData) {
    return (
      <div className="glass rounded-2xl p-5 h-full flex flex-col items-center justify-center gap-2">
        <p className="text-sky/40 text-sm font-body text-center">
          No training sessions logged yet.<br />Radar chart will appear after first session.
        </p>
      </div>
    );
  }

  const chartData = Object.keys(radarData).map((key) => ({
    metric: METRIC_LABELS[key],
    player: (radarData as Record<string, number>)[key],
    benchmark: (benchmark as Record<string, number>)[key],
    fullMark: 10,
  }));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4">
        <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
          Performance Radar
        </h3>
        <p className="text-xs text-sky/40 font-body mt-0.5">
          Season average vs {position} position benchmark
        </p>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="rgba(151,202,219,0.1)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "rgba(151,202,219,0.6)", fontSize: 11, fontFamily: "JetBrains Mono" }}
          />
          {/* Benchmark */}
          <Radar
            name="Position Avg"
            dataKey="benchmark"
            stroke="rgba(151,202,219,0.3)"
            fill="rgba(151,202,219,0.05)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          {/* Player */}
          <Radar
            name="Your Score"
            dataKey="player"
            stroke="#018ABE"
            fill="rgba(1,138,190,0.2)"
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(0,27,72,0.95)",
              border: "1px solid rgba(151,202,219,0.2)",
              borderRadius: "12px",
              fontSize: "12px",
              fontFamily: "JetBrains Mono",
            }}
            formatter={(value: number, name: string) => [`${value}/10`, name]}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Metric breakdown */}
      <div className="space-y-2 mt-2">
        {Object.keys(radarData).map((key) => {
          const val = (radarData as Record<string, number>)[key];
          const bench = (benchmark as Record<string, number>)[key];
          const diff = val - bench;
          return (
            <div key={key} className="flex items-center gap-3">
              <div className="w-20 text-[10px] font-mono text-sky/50 flex-shrink-0">
                {METRIC_LABELS[key]}
              </div>
              <div className="flex-1 h-1.5 bg-navy-800/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(val / 10) * 100}%`,
                    background: diff >= 0 ? "#018ABE" : "#f87171",
                  }}
                />
              </div>
              <span className="text-xs font-mono text-white w-6">{val}</span>
              <span className={`text-[10px] font-mono w-10 text-right ${diff >= 0 ? "text-green-400" : "text-red-400"}`}>
                {diff >= 0 ? "+" : ""}{diff.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-sky/10">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-ocean" />
          <span className="text-[10px] font-mono text-sky/40">Your Score</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-sky/30 border-dashed" style={{ borderTop: "1px dashed rgba(151,202,219,0.3)" }} />
          <span className="text-[10px] font-mono text-sky/40">{position} Benchmark</span>
        </div>
      </div>
    </div>
  );
}
