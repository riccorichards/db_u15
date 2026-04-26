"use client";
import { Player, ProductionProfile } from "@/types";
import { calcAvgRating, calcConsistencyScore } from "@/lib/stats";
import { Star, Zap, Target } from "lucide-react";
import Image from "next/image";
import { getPlayerImage } from "@/lib/playerImages";
import Link from "next/link";

interface Props {
  players: Player[];
  productionMap?: Record<string, ProductionProfile>;
}

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="text-yellow-400 font-display font-black text-lg">①</span>
    );
  if (rank === 2)
    return (
      <span className="text-gray-300 font-display font-black text-lg">②</span>
    );
  if (rank === 3)
    return (
      <span className="text-amber-600 font-display font-black text-lg">③</span>
    );
  return <span className="text-sky/30 font-mono text-sm">{rank}</span>;
}

function Avatar({ player }: { player: Player }) {
  return (
    <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-navy-800/60 flex-shrink-0 border border-sky/10">
      <Image
        src={getPlayerImage(player.avatarKey)}
        alt={`${player.name} ${player.surname}`}
        fill
        sizes="36px"
        className="object-cover object-top"
        quality={90}
      />
    </div>
  );
}

export default function RankingTable({ players, productionMap = {} }: Props) {
  // Position-aware composite score.
  //
  // AvgRating is the primary signal because it already reflects positional context:
  // a 7.5 for a CB is earned through defensive work, a 7.5 for a FWD through attacking
  // output. Making it the heaviest component makes the ranking fair across positions.
  //
  // Goal/Assist weights are reduced and position-scaled so defenders aren't penalised
  // for not scoring. DefensiveImpact (when available) is rewarded for DEF and GK.
  const CONTRIBUTION_WEIGHTS: Record<
    string,
    { g: number; a: number; def: number }
  > = {
    GK: { g: 0.5, a: 0.5, def: 3.0 },
    DEF: { g: 1.0, a: 1.5, def: 2.5 },
    MID: { g: 2.0, a: 2.0, def: 1.0 },
    FWD: { g: 3.0, a: 2.0, def: 0.5 },
  };

  const ranked = [...players]
    .map((p) => {
      const avgRating = calcAvgRating(p.ratings);
      const consistency = calcConsistencyScore(p.ratings);
      const production = productionMap[p._id ?? ""] ?? null;
      const w = CONTRIBUTION_WEIGHTS[p.position] ?? CONTRIBUTION_WEIGHTS.MID;

      const score =
        p.gamesPlayed === 0
          ? -1
          : avgRating * 4.0 + // primary signal — position-agnostic quality
            (p.minutesPlayed / 80) * 1.5 + // coach trust — time on pitch
            p.mvpCount * 4.0 + // standout performance recognition
            p.goals * w.g + // position-scaled attacking contribution
            p.assists * w.a + // position-scaled creation
            (p.minutesPlayed >= 160
              ? (production?.goalsPer80 ?? 0) * w.g * 0.5
              : 0); // efficiency bonus — min 2 full matches

      return { ...p, avgRating, consistency, score, production };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-sky/10 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
            Player Rankings
          </h3>
          <p className="text-xs text-sky/40 font-body mt-0.5">
            Rating×4 + MVP×4 + Minutes/80×1.5 + Position-weighted G/A
          </p>
        </div>
        <span className="glass rounded-lg px-3 py-1 text-xs font-mono text-sky/60">
          {players.length} players
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[40px_minmax(160px,1fr)_45px_50px_40px_40px_45px_50px_50px_50px_60px_80px] gap-1 px-4 py-2 text-[10px] font-mono text-sky/40 uppercase tracking-wider border-b border-sky/5 overflow-x-auto">
        <div>#</div>
        <div>Player</div>
        <div className="text-center">GP</div>
        <div className="text-center">MIN</div>
        <div className="text-center">G</div>
        <div className="text-center">A</div>
        <div className="text-center">MVP</div>
        <div className="text-center">RTG</div>
        <div className="text-center">G/80</div>
        <div className="text-center">A/80</div>
        <div className="text-center">WIN%</div>
        <div className="text-center">CONST.</div>
      </div>

      {/* Rows */}
      {ranked.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sky/30 font-body text-sm">
            No players yet. Add them from Admin.
          </p>
        </div>
      ) : (
        <div>
          {ranked.map((player, i) => {
            const rank = i + 1;
            const ratingColor =
              player.avgRating >= 8
                ? "text-green-400"
                : player.avgRating >= 6.5
                  ? "text-ocean"
                  : player.avgRating >= 5
                    ? "text-yellow-400"
                    : "text-red-400";

            const winRateColor =
              player.production?.matchWinRate != null
                ? player.production.matchWinRate >= 65
                  ? "text-green-400"
                  : player.production.matchWinRate >= 45
                    ? "text-ocean"
                    : "text-yellow-400"
                : "text-sky/30";

            return (
              <Link
                href={`/players/${player._id}`}
                key={player._id}
                className="rank-row grid grid-cols-[40px_minmax(160px,1fr)_45px_50px_40px_40px_45px_50px_50px_50px_60px_80px] gap-1 px-4 py-3 items-center overflow-x-auto"
              >
                {/* Rank */}
                <div className="flex items-center justify-center">
                  <MedalIcon rank={rank} />
                </div>

                {/* Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar player={player} />
                  <div className="min-w-0">
                    <div className="text-white font-display font-bold text-sm truncate">
                      {player.name} {player.surname}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-mono pos-${player.position}`}
                      >
                        {player.position}
                      </span>
                      <span className="text-sky/30 font-mono text-xs">
                        #{player.number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* GP */}
                <div className="text-center text-sm font-mono text-mist/70">
                  {player.gamesPlayed}
                </div>

                {/* Minutes */}
                <div className="text-center text-xs font-mono text-sky/50">
                  {player.minutesPlayed > 0 ? `${player.minutesPlayed}'` : "—"}
                </div>

                {/* Goals */}
                <div className="text-center">
                  <span className="flex items-center justify-center gap-0.5">
                    <Target size={10} className="text-ocean" />
                    <span className="text-sm font-mono font-bold text-white">
                      {player.goals}
                    </span>
                  </span>
                </div>

                {/* Assists */}
                <div className="text-center">
                  <span className="flex items-center justify-center gap-0.5">
                    <Zap size={10} className="text-sky" />
                    <span className="text-sm font-mono font-bold text-white">
                      {player.assists}
                    </span>
                  </span>
                </div>

                {/* MVP */}
                <div className="text-center">
                  <span className="flex items-center justify-center gap-0.5">
                    <Star size={10} className="text-yellow-400" />
                    <span className="text-sm font-mono font-bold text-yellow-300">
                      {player.mvpCount}
                    </span>
                  </span>
                </div>

                {/* Avg Rating */}
                <div
                  className={`text-center text-sm font-mono font-bold ${ratingColor}`}
                >
                  {player.avgRating > 0 ? player.avgRating.toFixed(1) : "—"}
                </div>

                {/* Goals per 80 */}
                <div className="text-center">
                  {player.production?.goalsPer80 != null &&
                  player.minutesPlayed >= 160 ? (
                    <span className="text-xs font-mono text-mist/70">
                      {player.production.goalsPer80.toFixed(2)}
                    </span>
                  ) : player.minutesPlayed > 0 && player.minutesPlayed < 160 ? (
                    <span
                      className="text-sky/20 font-mono text-xs"
                      title="Min 2 full matches needed"
                    >
                      —*
                    </span>
                  ) : (
                    <span className="text-sky/20 font-mono text-xs">—</span>
                  )}
                </div>

                {/* Assists per 80 */}
                <div className="text-center">
                  {player.production?.assistsPer80 != null &&
                  player.minutesPlayed >= 160 ? (
                    <span className="text-xs font-mono text-mist/70">
                      {player.production.assistsPer80.toFixed(2)}
                    </span>
                  ) : player.minutesPlayed > 0 && player.minutesPlayed < 160 ? (
                    <span
                      className="text-sky/20 font-mono text-xs"
                      title="Min 2 full matches needed"
                    >
                      —*
                    </span>
                  ) : (
                    <span className="text-sky/20 font-mono text-xs">—</span>
                  )}
                </div>

                {/* Match Win Rate */}
                <div
                  className={`text-center text-xs font-mono font-bold ${winRateColor}`}
                >
                  {player.production?.matchWinRate != null &&
                  player.minutesPlayed >= 160
                    ? `${player.production.matchWinRate.toFixed(0)}%`
                    : "—"}
                </div>

                {/* Consistency */}
                <div className="px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-mist/60 flex-shrink-0 w-10 text-right">
                      {player.consistency}%
                    </span>
                    <div className="flex-1 h-1.5 bg-navy-800/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ocean rounded-full"
                        style={{ width: `${player.consistency}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Column legend */}
      <div className="px-5 py-3 border-t border-sky/10 bg-navy-950/20 flex flex-wrap gap-x-4 gap-y-1">
        {[
          { col: "MIN", desc: "Total minutes played this season" },
          { col: "G/80", desc: "Goals per 80 min — shown after 160+ mins" },
          { col: "A/80", desc: "Assists per 80 min — shown after 160+ mins" },
          { col: "WIN%", desc: "Team win rate when this player played" },
          {
            col: "CONST.",
            desc: "Rating consistency — lower std dev = higher",
          },
        ].map(({ col, desc }) => (
          <div key={col} className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-sky/50">{col}:</span>
            <span className="text-[10px] font-body text-sky/30">{desc}</span>
          </div>
        ))}
        <span className="text-[10px] font-mono text-sky/20 ml-auto">
          —* insufficient minutes
        </span>
      </div>
    </div>
  );
}
