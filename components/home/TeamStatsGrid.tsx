"use client";
import { TeamStats } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  stats: TeamStats;
}

function DonutChart({ wins, draws, losses }: { wins: number; draws: number; losses: number }) {
  const data = [
    { name: "Wins", value: wins, color: "#4ade80" },
    { name: "Draws", value: draws, color: "#facc15" },
    { name: "Losses", value: losses, color: "#f87171" },
  ].filter((d) => d.value > 0);

  if (!data.length) {
    return (
      <div className="w-24 h-24 rounded-full bg-navy-800/40 flex items-center justify-center">
        <span className="text-sky/30 text-xs">No data</span>
      </div>
    );
  }

  return (
    <div className="relative w-24 h-24">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={28}
            outerRadius={42}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [value, name]}
            contentStyle={{
              background: "rgba(0,27,72,0.9)",
              border: "1px solid rgba(151,202,219,0.2)",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "JetBrains Mono",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display font-black text-lg text-white">
          {wins + draws + losses}
        </span>
      </div>
    </div>
  );
}

export default function TeamStatsGrid({ stats }: Props) {
  const goalDiff = stats.totalGoals - stats.receivedGoals;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
            Team Performance
          </h3>
          <p className="text-xs text-sky/40 font-body mt-0.5">Season overview</p>
        </div>
      </div>

      {/* W/D/L donut + legend */}
      <div className="flex items-center gap-5 mb-5 pb-5 border-b border-sky/10">
        <DonutChart wins={stats.wins} draws={stats.draws} losses={stats.losses} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs font-body text-sky/60">Wins</span>
            </div>
            <span className="font-mono font-bold text-white text-sm">{stats.wins}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-xs font-body text-sky/60">Draws</span>
            </div>
            <span className="font-mono font-bold text-white text-sm">{stats.draws}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs font-body text-sky/60">Losses</span>
            </div>
            <span className="font-mono font-bold text-white text-sm">{stats.losses}</span>
          </div>
        </div>
      </div>

      {/* Goal stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="glass-bright rounded-xl p-3 text-center">
          <div className="font-display text-2xl font-black text-white">{stats.totalGoals}</div>
          <div className="text-xs text-sky/50 font-body mt-0.5">Goals</div>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <div className="font-display text-2xl font-black text-mist/70">{stats.receivedGoals}</div>
          <div className="text-xs text-sky/50 font-body mt-0.5">Received</div>
        </div>
        <div
          className={`rounded-xl p-3 text-center ${
            goalDiff > 0
              ? "bg-green-500/10 border border-green-500/20"
              : goalDiff < 0
              ? "bg-red-500/10 border border-red-500/20"
              : "glass"
          }`}
        >
          <div
            className={`font-display text-2xl font-black ${
              goalDiff > 0 ? "text-green-400" : goalDiff < 0 ? "text-red-400" : "text-white"
            }`}
          >
            {goalDiff > 0 ? "+" : ""}{goalDiff}
          </div>
          <div className="text-xs text-sky/50 font-body mt-0.5">Diff</div>
        </div>
      </div>

      {/* Position + lost points */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-3">
          <div className="text-xs text-sky/50 font-body mb-1">Current Position</div>
          <div className="flex items-end gap-1">
            <span className="font-display text-3xl font-black text-ocean">
              {stats.currentPosition}
            </span>
            <span className="text-sky/40 font-mono text-xs mb-1">/ league</span>
          </div>
        </div>
        <div className="glass rounded-xl p-3">
          <div className="text-xs text-sky/50 font-body mb-1">Lost Points</div>
          <div className="flex items-end gap-1">
            <span className="font-display text-3xl font-black text-red-400">
              {stats.lostPoints}
            </span>
            <span className="text-sky/40 font-mono text-xs mb-1">pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
