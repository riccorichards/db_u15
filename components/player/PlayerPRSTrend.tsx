"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp } from "lucide-react";

interface PRSPoint { date: string; prs: number; sessionType: string; }

const SESSION_COLORS: Record<string, string> = {
  tactical: "#818cf8", physical: "#f87171", technical: "#a78bfa",
  mixed: "#018ABE", recovery: "#4ade80",
};

const CustomDot = (props: { cx?: number; cy?: number; payload?: PRSPoint }) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  return <circle cx={cx} cy={cy} r={4} fill={SESSION_COLORS[payload.sessionType] ?? "#018ABE"} stroke="#050d1a" strokeWidth={2} />;
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: PRSPoint }[]; label?: string }) => {
  if (active && payload?.length) {
    const p = payload[0].payload;
    return (
      <div className="glass rounded-xl px-3 py-2 text-xs border border-sky/10">
        <p className="text-sky/60 font-body mb-1">{new Date(p.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>
        <p className="text-white font-mono font-bold">PRS: {p.prs}</p>
        <p className="text-sky/50 capitalize">{p.sessionType}</p>
      </div>
    );
  }
  return null;
};

export default function PlayerPRSTrend({ prsTrend }: { prsTrend: PRSPoint[] }) {
  if (!prsTrend.length) {
    return (
      <div className="glass rounded-2xl p-5 h-full flex items-center justify-center">
        <p className="text-sky/40 text-sm font-body text-center">No sessions yet.<br />PRS trend will appear here.</p>
      </div>
    );
  }

  const avg = Math.round(prsTrend.reduce((a, p) => a + p.prs, 0) / prsTrend.length);
  const latest = prsTrend[prsTrend.length - 1].prs;
  const trend = prsTrend.length > 1 ? latest - prsTrend[prsTrend.length - 2].prs : 0;

  const displayData = prsTrend.map((p) => ({
    ...p,
    date: new Date(p.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">Readiness Trend</h3>
          <p className="text-xs text-sky/40 font-body mt-0.5">Player Readiness Score per session</p>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl font-black text-ocean">{latest}</div>
          <div className={`text-xs font-mono ${trend >= 0 ? "text-green-400" : "text-red-400"}`}>
            {trend >= 0 ? "↑" : "↓"}{Math.abs(trend)} vs last
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={displayData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(151,202,219,0.07)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "rgba(151,202,219,0.4)", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "rgba(151,202,219,0.4)", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={75} stroke="rgba(74,222,128,0.3)" strokeDasharray="4 4" label={{ value: "Ready", fill: "rgba(74,222,128,0.5)", fontSize: 10 }} />
          <ReferenceLine y={50} stroke="rgba(250,204,21,0.3)" strokeDasharray="4 4" label={{ value: "Monitor", fill: "rgba(250,204,21,0.5)", fontSize: 10 }} />
          <ReferenceLine y={avg} stroke="rgba(1,138,190,0.4)" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="prs" stroke="#018ABE" strokeWidth={2.5} dot={<CustomDot />} activeDot={{ r: 6, fill: "#97CADB", stroke: "#018ABE", strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-sky/10 text-[10px] font-mono text-sky/40">
        <span>Avg: {avg}/100</span>
        <span>{prsTrend.length} sessions logged</span>
      </div>
    </div>
  );
}
