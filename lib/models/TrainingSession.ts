import mongoose, { Schema } from "mongoose";

const PlayerSessionLogSchema = new Schema(
  {
    playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    workRate: { type: Number, min: 1, max: 10, required: true },
    technicalQuality: { type: Number, min: 1, max: 10, required: true },
    tacticalAwareness: { type: Number, min: 1, max: 10, required: true },
    focusLevel: { type: Number, min: 1, max: 10, required: true },
    bodyLanguage: { type: Number, min: 1, max: 10, required: true },
    coachability: { type: Number, min: 1, max: 10, required: true },
    emotionalState: {
      type: String,
      enum: ["happy", "neutral", "tired", "frustrated", "anxious"],
      default: "neutral",
    },
    fatigueLevel: { type: Number, min: 1, max: 10, required: true },
    injuryFlag: { type: Boolean, default: false },
    minutesParticipated: { type: Number, default: 90 },
    prs: { type: Number, default: 0 },
    readinessLabel: {
      type: String,
      enum: ["match_ready", "monitor", "rest"],
      default: "monitor",
    },
  },
  { _id: false }
);

const TrainingSessionSchema = new Schema(
  {
    date: { type: String, required: true },
    sessionType: {
      type: String,
      enum: ["tactical", "physical", "technical", "mixed", "recovery"],
      required: true,
    },
    intensity: { type: Number, min: 1, max: 10, required: true },
    quality: { type: Number, min: 1, max: 10, required: true },
    attendancePct: { type: Number, min: 0, max: 100, required: true },
    fatigue: { type: Number, min: 1, max: 10, required: true },
    coachRating: { type: Number, min: 1, max: 10, required: true },
    notes: { type: String, default: "" },
    teamTC: { type: Number, default: 0 },
    teamMS: { type: Number, default: 0 },
    playerLogs: [PlayerSessionLogSchema],
  },
  { timestamps: true }
);

export default mongoose.models.TrainingSession ||
  mongoose.model("TrainingSession", TrainingSessionSchema);
