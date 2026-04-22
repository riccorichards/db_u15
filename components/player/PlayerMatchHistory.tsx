"use client";
import { Star, Target, Zap } from "lucide-react";

interface MatchPerf {
  date: string; opponent: string; homeAway: string; result: "W" | "D" | "L";
  goalsFor: number; goalsAgainst: number;
  minutesPlayed: number; goals: number; assists: number;
  rating: number; isMvp: boolean; yellowCard: boolean; redCard: boolean;
}

const ratingColor = (r: number) =>
  r >= 8 ? "text-green-400" : r >= 6.5 ? "text-ocean" : r >= 5 ? "text-yellow-400" : r > 0 ? "text-red-400" : "text-sky/20";

export default function PlayerMatchHistory({ matchPerformances }: { matchPerformances: MatchPerf[] }) {
  const played = [...matchPerformances].filter(m => m.minutesPlayed > 0).reverse();

  if (!played.length) {
    return (
      <div className="glass rounded-2xl p-5 flex items-center justify-center h-32">
        <p className="text-sky/40 text-sm font-body">No match appearances yet.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-sky/10 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">Match History</h3>
          <p className="text-xs text-sky/40 font-body mt-0.5">{played.length} appearances this season</p>
        </div>
      </div>

      {/* Headers */}
      <div className="grid grid-cols-[100px_1fr_60px_60px_60px_60px_60px_60px] gap-2 px-4 py-2 text-[10px] font-mono text-sky/30 uppercase tracking-wider border-b border-sky/5">
        <div>Date</div>
        <div>Opponent</div>
        <div className="text-center">Score</div>
        <div className="text-center">MIN</div>
        <div className="text-center">G</div>
        <div className="text-center">A</div>
        <div className="text-center">RTG</div>
        <div className="text-center">Notes</div>
      </div>

      {played.map((m, i) => (
        <div
          key={i}
          className="grid grid-cols-[100px_1fr_60px_60px_60px_60px_60px_60px] gap-2 px-4 py-3 items-center border-b border-sky/5 hover:bg-ocean/5 transition-colors"
        >
          <div className="text-xs font-mono text-sky/50">
            {new Date(m.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono result-${m.result}`}>{m.result}</span>
            <span className="text-white text-sm font-display font-bold truncate">vs {m.opponent}</span>
            <span className="text-sky/30 text-[10px] font-mono">{m.homeAway}</span>
          </div>
          <div className="text-center text-xs font-mono text-sky/60">
            {m.goalsFor}–{m.goalsAgainst}
          </div>
          <div className="text-center text-xs font-mono text-mist/60">{m.minutesPlayed}&apos;</div>
          <div className="text-center">
            {m.goals > 0 ? (
              <span className="flex items-center justify-center gap-0.5">
                <Target size={10} className="text-ocean" />
                <span className="text-sm font-mono font-bold text-white">{m.goals}</span>
              </span>
            ) : <span className="text-sky/20 font-mono text-sm">—</span>}
          </div>
          <div className="text-center">
            {m.assists > 0 ? (
              <span className="flex items-center justify-center gap-0.5">
                <Zap size={10} className="text-sky" />
                <span className="text-sm font-mono font-bold text-white">{m.assists}</span>
              </span>
            ) : <span className="text-sky/20 font-mono text-sm">—</span>}
          </div>
          <div className={`text-center text-sm font-mono font-bold ${ratingColor(m.rating)}`}>
            {m.rating > 0 ? m.rating.toFixed(1) : "—"}
          </div>
          <div className="flex items-center justify-center gap-1">
            {m.isMvp && <Star size={11} className="text-yellow-400" />}
            {m.yellowCard && <div className="w-2.5 h-3 bg-yellow-400 rounded-sm" />}
            {m.redCard && <div className="w-2.5 h-3 bg-red-500 rounded-sm" />}
          </div>
        </div>
      ))}
    </div>
  );
}
