"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TeamStats } from "@/types";

interface Props {
  stats: TeamStats;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs">
        <p className="text-sky/70 font-body mb-1">{label}</p>
        <p className="text-white font-mono font-bold">
          Avg Rating: {payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function RatingChart({ stats }: Props) {
  const data = stats.avgRatingHistory;

  if (!data.length) {
    return (
      <div className="glass rounded-2xl p-5 h-full flex items-center justify-center">
        <p className="text-sky/40 text-sm font-body">No match data yet</p>
      </div>
    );
  }

  const avgAll =
    data.reduce((a, d) => a + d.avg, 0) / data.length;

  return (
    <div className="glass rounded-2xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
            Team Rating / Game
          </h3>
          <p className="text-xs text-sky/50 font-body mt-0.5">
            Avg player rating per match
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-bold text-ocean">
            {avgAll.toFixed(1)}
          </div>
          <div className="text-xs text-sky/50 font-body">Season avg</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(151,202,219,0.07)"
            vertical={false}
          />
          <XAxis
            dataKey="match"
            tick={{ fill: "rgba(151,202,219,0.4)", fontSize: 10, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
            interval={0}
            tickFormatter={(v) => v.split(" ")[0]}
          />
          <YAxis
            domain={[4, 10]}
            tick={{ fill: "rgba(151,202,219,0.4)", fontSize: 10, fontFamily: "JetBrains Mono" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avgAll}
            stroke="rgba(1,138,190,0.4)"
            strokeDasharray="4 4"
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#018ABE"
            strokeWidth={2.5}
            dot={{ fill: "#018ABE", r: 4, strokeWidth: 2, stroke: "#050d1a" }}
            activeDot={{ r: 6, fill: "#97CADB", stroke: "#018ABE", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
