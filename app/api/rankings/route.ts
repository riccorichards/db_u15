import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MatchModel from "@/lib/models/Match";
import PlayerModel from "@/lib/models/Player";
import { calcProductionProfile } from "@/lib/stats";

type PlayerStats = {
  gamesPlayed: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  mvpCount: number;
  yellowCards: number;
  redCards: number;
  ratings: number[];
};

const EMPTY_STATS: PlayerStats = {
  gamesPlayed: 0,
  minutesPlayed: 0,
  goals: 0,
  assists: 0,
  mvpCount: 0,
  yellowCards: 0,
  redCards: 0,
  ratings: [],
};

export async function GET() {
  try {
    await connectDB();

    const [matches, players] = await Promise.all([
      MatchModel.find({}).sort({ date: 1 }).lean(),
      PlayerModel.find({}).lean(),
    ]);

    // ── Aggregate per-player stats from Match documents ───────────
    const statsMap: Record<string, PlayerStats> = {};

    for (const match of matches) {
      for (const perf of match.playerPerformances) {
        const pid = String(perf.playerId);

        if (!statsMap[pid]) {
          statsMap[pid] = { ...EMPTY_STATS, ratings: [] };
        }

        const s = statsMap[pid]!;

        if (perf.minutesPlayed > 0) s.gamesPlayed++;
        s.minutesPlayed += perf.minutesPlayed ?? 0;
        s.goals += perf.goals ?? 0;
        s.assists += perf.assists ?? 0;
        if (perf.isMvp) s.mvpCount++;
        if (perf.yellowCard) s.yellowCards++;
        if (perf.redCard) s.redCards++;

        // Use officialRating (CMR-blended) when available.
        // Fall back to raw coach rating for old matches logged before CMR existed.
        if (perf.minutesPlayed > 0) {
          const rating = (perf as any).officialRating ?? perf.rating;
          if (rating != null) s.ratings.push(rating);
        }
      }
    }

    // ── Build response — identity from Player doc, stats from Match docs ──
    const ranked = players.map((player) => {
      const pid = String(player._id);
      const stats: PlayerStats = statsMap[pid] ?? {
        ...EMPTY_STATS,
        ratings: [],
      };

      const playerForProduction = { ...player, ...stats };
      const production = calcProductionProfile(
        playerForProduction as any,
        matches as any,
      );

      return {
        _id: pid,
        name: player.name,
        surname: player.surname,
        position: player.position,
        number: player.number,
        avatarKey: player.avatarKey,
        gamesPlayed: stats.gamesPlayed,
        minutesPlayed: stats.minutesPlayed,
        goals: stats.goals,
        assists: stats.assists,
        mvpCount: stats.mvpCount,
        yellowCards: stats.yellowCards,
        redCards: stats.redCards,
        ratings: stats.ratings,
        production,
      };
    });

    return NextResponse.json(ranked);
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Failed to compute rankings";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
