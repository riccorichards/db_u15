import mongoose, { Schema } from "mongoose";

const PlayerPerformanceSchema = new Schema(
  {
    playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    minutesPlayed: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    rating: { type: Number, min: 1, max: 10, required: true },
    isMvp: { type: Boolean, default: false },
    yellowCard: { type: Boolean, default: false },
    redCard: { type: Boolean, default: false },
  },
  { _id: false }
);

const MatchSchema = new Schema(
  {
    date: { type: String, required: true },
    opponent: { type: String, required: true },
    homeAway: { type: String, enum: ["home", "away"], required: true },
    goalsFor: { type: Number, required: true },
    goalsAgainst: { type: Number, required: true },
    result: { type: String, enum: ["W", "D", "L"], required: true },
    trainingCondition: { type: Number, min: 0, max: 1, required: true },
    mentalityScore: { type: Number, min: 0, max: 1, required: true },
    playerPerformances: [PlayerPerformanceSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Match || mongoose.model("Match", MatchSchema);
