import connectDB from "@/lib/mongodb";
import MatchModel from "@/lib/models/Match";
import PlayerModel from "@/lib/models/Player";

/**
 * Recomputes all cumulative stats for a single player by aggregating
 * directly from the Match collection. Called after every match mutation
 * (add or delete) so the Player document is always consistent with reality.
 *
 * Uses $set, never $inc — so corrupted state is always corrected, not compounded.
 */
export async function recomputePlayerStats(playerId: string): Promise<void> {
  await connectDB();

  // Pull every match where this player has a performance entry
  const matches = await MatchModel.find({
    "playerPerformances.playerId": playerId,
  }).lean();

  // Aggregate from scratch
  let gamesPlayed = 0;
  let minutesPlayed = 0;
  let goals = 0;
  let assists = 0;
  let mvpCount = 0;
  let yellowCards = 0;
  let redCards = 0;
  const ratings: number[] = [];

  for (const match of matches) {
    const perf = match.playerPerformances.find(
      (p: any) => String(p.playerId) === String(playerId),
    );
    if (!perf) continue;

    if (perf.minutesPlayed > 0) gamesPlayed++;
    minutesPlayed += perf.minutesPlayed ?? 0;
    goals += perf.goals ?? 0;
    assists += perf.assists ?? 0;
    if (perf.isMvp) mvpCount++;
    if (perf.yellowCard) yellowCards++;
    if (perf.redCard) redCards++;

    // Use officialRating (CMR-blended) when available.
    // Fall back to raw coach rating for matches logged before CMR was introduced.
    const ratingToStore =
      perf.officialRating != null ? perf.officialRating : perf.rating;
    if (ratingToStore != null && perf.minutesPlayed > 0) {
      ratings.push(ratingToStore);
    }
  }

  await PlayerModel.findByIdAndUpdate(playerId, {
    $set: {
      gamesPlayed,
      minutesPlayed,
      goals,
      assists,
      mvpCount,
      yellowCards,
      redCards,
      ratings,
    },
  });
}
