"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

interface MatchPerf {
  date: string;
  opponent: string;
  result: "W" | "D" | "L";
  rating: number;
  goals: number;
  assists: number;
  isMvp: boolean;
  minutesPlayed: number;
}

const RESULT_COLORS = { W: "#4ade80", D: "#facc15", L: "#f87171" };

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: MatchPerf }[];
}) => {
  if (active && payload?.length) {
    const m = payload[0].payload;
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs border border-sky/10 space-y-1">
        <p className="text-white font-display font-bold">vs {m.opponent}</p>
        <p className="text-sky/60 font-body">
          {new Date(m.date).toLocaleDateString("en", {
            month: "short",
            day: "numeric",
          })}
        </p>
        <p
          className={`font-mono font-bold ${RESULT_COLORS[m.result] ? `text-[${RESULT_COLORS[m.result]}]` : "text-white"}`}
        >
          Result: {m.result}
        </p>
        <p className="text-white font-mono">Rating: {m.rating}/10</p>
        <p className="text-sky/60 font-mono">
          {m.goals}G {m.assists}A · {m.minutesPlayed}'
        </p>
        {m.isMvp && <p className="text-yellow-400 font-mono">⭐ MVP</p>}
      </div>
    );
  }
  return null;
};

export default function PlayerMatchRatingChart({
  matchPerformances,
  avgRating,
}: {
  matchPerformances: MatchPerf[];
  avgRating: number;
}) {
  const played = matchPerformances.filter((m) => m.minutesPlayed > 0);

  if (!played.length) {
    return (
      <div className="glass rounded-2xl p-5 flex items-center justify-center h-40">
        <p className="text-sky/40 text-sm font-body">
          No match appearances yet.
        </p>
      </div>
    );
  }

  const displayData = played.map((m) => ({
    ...m,
    label: `vs ${m.opponent}`,
  }));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
            Match Ratings
          </h3>
          <p className="text-xs text-sky/40 font-body mt-0.5">
            Performance rating per appearance
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-black text-ocean">
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          </div>
          <div className="text-xs text-sky/40 font-mono">season avg</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          data={displayData}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(151,202,219,0.07)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{
              fill: "rgba(151,202,219,0.4)",
              fontSize: 10,
              fontFamily: "JetBrains Mono",
            }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 10]}
            tick={{
              fill: "rgba(151,202,219,0.4)",
              fontSize: 10,
              fontFamily: "JetBrains Mono",
            }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {avgRating > 0 && (
            <ReferenceLine
              y={avgRating}
              stroke="rgba(1,138,190,0.4)"
              strokeDasharray="4 4"
            />
          )}
          <Bar dataKey="rating" radius={[4, 4, 0, 0]}>
            {displayData.map((m, i) => (
              <Cell
                key={i}
                fill={
                  m.rating >= 8
                    ? "#4ade80"
                    : m.rating >= 6.5
                      ? "#018ABE"
                      : m.rating >= 5
                        ? "#facc15"
                        : "#f87171"
                }
                opacity={m.isMvp ? 1 : 0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Result badges */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {played.map((m, i) => (
          <div
            key={i}
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded result-${m.result}`}
          >
            {m.result}
          </div>
        ))}
      </div>
    </div>
  );
}
