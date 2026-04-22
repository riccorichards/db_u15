"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Dumbbell } from "lucide-react";

interface SessionPoint {
  date: string;
  tc: number;
  ms: number;
  type: string;
}

interface Props {
  sessions: SessionPoint[];
}

const SESSION_COLORS: Record<string, string> = {
  tactical:  "#818cf8",
  physical:  "#f87171",
  technical: "#a78bfa",
  mixed:     "#018ABE",
  recovery:  "#4ade80",
};

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs border border-sky/10">
        <p className="text-sky/60 font-body mb-1.5">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2 mb-0.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-sky/70 font-body">{p.name}:</span>
            <span className="text-white font-mono font-bold">{p.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomDot = (props: {
  cx?: number; cy?: number; payload?: SessionPoint;
}) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  const color = SESSION_COLORS[payload.type] ?? "#018ABE";
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#050d1a" strokeWidth={2} />;
};

export default function TrainingTrendChart({ sessions }: Props) {
  if (!sessions.length) {
    return (
      <div className="glass rounded-2xl p-5 h-full flex flex-col items-center justify-center gap-2">
        <Dumbbell size={28} className="text-sky/20" />
        <p className="text-sky/40 text-sm font-body text-center">
          No training sessions logged yet.<br />
          Add sessions in Admin → Training.
        </p>
      </div>
    );
  }

  const latestTC = sessions[sessions.length - 1]?.tc ?? 0;
  const latestMS = sessions[sessions.length - 1]?.ms ?? 0;
  const tcTrend  = sessions.length > 1 ? sessions[sessions.length - 1].tc - sessions[sessions.length - 2].tc : 0;
  const msTrend  = sessions.length > 1 ? sessions[sessions.length - 1].ms - sessions[sessions.length - 2].ms : 0;

  const displayData = sessions.map((s) => ({
    ...s,
    date: new Date(s.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="glass rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
            Training Trend
          </h3>
          <p className="text-xs text-sky/40 font-body mt-0.5">
            TC & MS over last {sessions.length} sessions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-ocean" />
              <span className="text-xs font-mono text-sky/50">TC</span>
              <span className={`text-sm font-mono font-bold ${
                latestTC >= 70 ? "text-green-400" : latestTC >= 50 ? "text-ocean" : "text-yellow-400"
              }`}>{latestTC}%</span>
              <span className={`text-[10px] font-mono ${tcTrend >= 0 ? "text-green-400" : "text-red-400"}`}>
                {tcTrend >= 0 ? "↑" : "↓"}{Math.abs(tcTrend)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-xs font-mono text-sky/50">MS</span>
              <span className={`text-sm font-mono font-bold ${
                latestMS >= 70 ? "text-green-400" : latestMS >= 50 ? "text-purple-400" : "text-yellow-400"
              }`}>{latestMS}%</span>
              <span className={`text-[10px] font-mono ${msTrend >= 0 ? "text-green-400" : "text-red-400"}`}>
                {msTrend >= 0 ? "↑" : "↓"}{Math.abs(msTrend)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={displayData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(151,202,219,0.07)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(151,202,219,0.4)", fontSize: 10, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "rgba(151,202,219,0.4)", fontSize: 10, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="tc"
            name="Training Condition"
            stroke="#018ABE"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: "#97CADB", stroke: "#018ABE", strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="ms"
            name="Mentality Score"
            stroke="#a78bfa"
            strokeWidth={2.5}
            strokeDasharray="5 3"
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: "#c4b5fd", stroke: "#a78bfa", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Session type legend */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-sky/10">
        <span className="text-[10px] font-mono text-sky/30 mr-1">Session types:</span>
        {Object.entries(SESSION_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <span className="text-[10px] font-mono text-sky/40 capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
