import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PlayerModel from "@/lib/models/Player";
import { recomputePlayerStats } from "@/lib/recomputePlayerStats";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const players = await PlayerModel.find({}, "_id").lean();

  const results: { playerId: string; status: string }[] = [];

  for (const player of players) {
    try {
      await recomputePlayerStats(String(player._id));
      results.push({ playerId: String(player._id), status: "ok" });
    } catch (err) {
      results.push({
        playerId: String(player._id),
        status: `error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  }

  return NextResponse.json({
    recomputed: results.length,
    results,
  });
}
