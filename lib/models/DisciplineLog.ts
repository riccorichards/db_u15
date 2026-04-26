import mongoose, { Schema } from "mongoose";

const DISCIPLINE_TYPES = [
  "yellow_card",
  "red_card",
  "late_training",
  "early_exit",
  "low_coachability",
  "repeated_negative_state",
  "full_attendance_week",
  "high_coachability_streak",
] as const;

const DisciplineLogSchema = new Schema(
  {
    playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    type: { type: String, enum: DISCIPLINE_TYPES, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.models.DisciplineLog ||
  mongoose.model("DisciplineLog", DisciplineLogSchema);
