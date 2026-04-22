"use client";
import { Player } from "@/types";
import { calcAvgRating, calcConsistencyScore } from "@/lib/stats";
import { Star, Zap, Target } from "lucide-react";
import Image from "next/image";

import { getPlayerImage } from "@/lib/playerImages";

import Link from "next/link";

interface Props {
  players: Player[];
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

export default function RankingTable({ players }: Props) {
  // Sort by composite score: goals*3 + assists*2 + mvp*5 + avgRating*2
  const ranked = [...players]
    .map((p) => ({
      ...p,
      avgRating: calcAvgRating(p.ratings),
      consistency: calcConsistencyScore(p.ratings),
      score:
        p.gamesPlayed === 0
          ? -1
          : p.goals * 3 +
            p.assists * 2 +
            p.mvpCount * 5 +
            calcAvgRating(p.ratings) * 2 +
            (p.minutesPlayed / 80) * 1.5,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Table header */}
      <div className="px-5 py-4 border-b border-sky/10 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wider text-white">
            Player Rankings
          </h3>
          <p className="text-xs text-sky/40 font-body mt-0.5">
            Score = Goals×3 + Assists×2 + MVP×5 + AvgRating×2
          </p>
        </div>
        <span className="glass rounded-lg px-3 py-1 text-xs font-mono text-sky/60">
          {players.length} players
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[40px_1fr_60px_60px_60px_60px_60px_60px_80px] gap-2 px-4 py-2 text-xs font-mono text-sky/40 uppercase tracking-wider border-b border-sky/5">
        <div>#</div>
        <div>Player</div>
        <div className="text-center">GP</div>
        <div className="text-center">MIN</div>
        <div className="text-center">G</div>
        <div className="text-center">A</div>
        <div className="text-center">MVP</div>
        <div className="text-center">RTG</div>
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

            return (
              <Link
                href={`/players/${player._id}`}
                key={player._id}
                className="rank-row grid grid-cols-[40px_1fr_60px_60px_60px_60px_60px_60px_80px] gap-2 px-4 py-3 items-center"
              >
                {/* Rank */}
                <div className="flex items-center justify-center">
                  <MedalIcon rank={rank} />
                </div>

                {/* Player identity */}
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

                {/* Stats */}
                <div className="text-center text-sm font-mono text-mist/70">
                  {player.gamesPlayed}
                </div>
                <div className="text-center text-xs font-mono text-mist/50">
                  {player.minutesPlayed}'
                </div>
                <div className="text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Target size={11} className="text-ocean" />
                    <span className="text-sm font-mono font-bold text-white">
                      {player.goals}
                    </span>
                  </span>
                </div>
                <div className="text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Zap size={11} className="text-sky" />
                    <span className="text-sm font-mono font-bold text-white">
                      {player.assists}
                    </span>
                  </span>
                </div>
                <div className="text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Star size={11} className="text-yellow-400" />
                    <span className="text-sm font-mono font-bold text-yellow-300">
                      {player.mvpCount}
                    </span>
                  </span>
                </div>
                <div
                  className={`text-center text-sm font-mono font-bold ${ratingColor}`}
                >
                  {player.avgRating > 0 ? player.avgRating.toFixed(1) : "—"}
                </div>
                <div className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-mono text-mist/60">
                      {player.consistency}%
                    </span>
                    <div className="w-10 h-1 bg-navy-800/60 rounded-full overflow-hidden">
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
    </div>
  );
}
