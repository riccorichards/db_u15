import mongoose, { Schema } from "mongoose";

const KPITargetSchema = new Schema(
  {
    playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    season: { type: String, required: true }, // e.g. "2025/26"
    targets: {
      prsAvg: { type: Number, default: null }, // 0–100
      goals: { type: Number, default: null },
      avgRating: { type: Number, default: null }, // 1–10
      attendanceRate: { type: Number, default: null }, // 0–100
      consistencyScore: { type: Number, default: null }, // 0–100
      disciplineScore: { type: Number, default: null }, // 0–100
      pillarOverall: { type: Number, default: null }, // 1–10
    },
  },
  { timestamps: true },
);

// One KPI document per player per season
KPITargetSchema.index({ playerId: 1, season: 1 }, { unique: true });

export default mongoose.models.PlayerKPI ||
  mongoose.model("PlayerKPI", KPITargetSchema);
