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

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: { structured: boolean } }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs border border-sky/10">
        <p className="text-sky/70 font-body mb-1">{label}</p>
        <p className="text-white font-mono font-bold">
          Avg Rating: {payload[0].value.toFixed(2)}
        </p>
        <p className="text-[10px] text-sky/40 font-mono mt-0.5">
          {payload[0].payload.structured
            ? "★ structured rating"
            : "coach rating"}
        </p>
      </div>
    );
  }
  return null;
};

const CustomDot = (props: {
  cx?: number;
  cy?: number;
  payload?: { structured: boolean };
}) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={payload?.structured ? 5 : 3.5}
      fill={payload?.structured ? "#97CADB" : "#018ABE"}
      stroke="#050d1a"
      strokeWidth={2}
    />
  );
};

export default function RatingChart({ stats }: Props) {
  // avgRatingHistory uses officialRating where available (written by matches route).
  // Add a `structured` flag based on whether the avg is meaningfully different from
  // a gut-feel round number — a proxy since we can't know server-side here.
  const data = stats.avgRatingHistory.map((d) => ({
    ...d,
    structured: d.avg % 0.5 !== 0, // rough heuristic: non-half values = computed CMR
  }));

  if (!data.length) {
    return (
      <div className="glass rounded-2xl p-5 h-full flex items-center justify-center">
        <p className="text-sky/40 text-sm font-body">No match data yet</p>
      </div>
    );
  }

  const avgAll = data.reduce((a, d) => a + d.avg, 0) / data.length;
  const structuredCount = data.filter((d) => d.structured).length;

  return (
    <div className="glass rounded-2xl p-5 h-full flex flex-col">
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

      <ResponsiveContainer width="100%" height={175}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(151,202,219,0.07)"
            vertical={false}
          />
          <XAxis
            dataKey="match"
            tick={{
              fill: "rgba(151,202,219,0.4)",
              fontSize: 10,
              fontFamily: "JetBrains Mono",
            }}
            tickLine={false}
            axisLine={false}
            interval={0}
            tickFormatter={(v) => v.split(" ")[0]}
          />
          <YAxis
            domain={[4, 10]}
            tick={{
              fill: "rgba(151,202,219,0.4)",
              fontSize: 10,
              fontFamily: "JetBrains Mono",
            }}
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
            dot={<CustomDot />}
            activeDot={{
              r: 6,
              fill: "#97CADB",
              stroke: "#018ABE",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-sky/10">
        <div className="flex items-center gap-1.5">
          <circle />
          <div className="w-3 h-3 rounded-full bg-sky/60 border-2 border-navy-950" />
          <span className="text-[10px] font-mono text-sky/40">
            ★ structured (CMR)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-ocean border-2 border-navy-950" />
          <span className="text-[10px] font-mono text-sky/40">
            coach rating
          </span>
        </div>
        {structuredCount > 0 && (
          <span className="ml-auto text-[10px] font-mono text-sky/30">
            {structuredCount}/{data.length} structured
          </span>
        )}
      </div>
    </div>
  );
}
