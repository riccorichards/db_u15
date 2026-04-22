import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TrainingSessionModel from "@/lib/models/TrainingSession";
import PlayerModel from "@/lib/models/Player";
import { calcPRS, calcSessionMS, calcSessionTC, prsLabel } from "@/lib/stats";
import { PlayerSessionLog } from "@/types";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const sessions = await TrainingSessionModel.find({})
      .sort({ date: -1 })
      .limit(limit)
      .lean();
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch player positions for PRS calculation
    const playerIds = (body.playerLogs ?? []).map((l: { playerId: string }) => l.playerId);
    const players = await PlayerModel.find({ _id: { $in: playerIds } }).lean();
    const posMap = Object.fromEntries(players.map((p) => [String(p._id), p.position as string]));

    // Compute PRS per player log
    const enrichedLogs = (body.playerLogs ?? []).map((log: PlayerSessionLog) => {
      const position = posMap[String(log.playerId)] ?? "MID";
      const prs = calcPRS(log, position);
      return { ...log, prs, readinessLabel: prsLabel(prs) };
    });

    // Compute team TC and MS
    const teamTC = calcSessionTC({
      intensity:     body.intensity,
      quality:       body.quality,
      attendancePct: body.attendancePct,
      fatigue:       body.fatigue,
    });
    const teamMS = calcSessionMS(enrichedLogs);

    const session = await TrainingSessionModel.create({
      date:          body.date,
      sessionType:   body.sessionType,
      intensity:     body.intensity,
      quality:       body.quality,
      attendancePct: body.attendancePct,
      fatigue:       body.fatigue,
      coachRating:   body.coachRating,
      notes:         body.notes ?? "",
      teamTC,
      teamMS,
      playerLogs:    enrichedLogs,
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create session";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
