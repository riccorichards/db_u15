import mongoose, { Schema } from "mongoose";

const OpponentSchema = new Schema(
  {
    name: { type: String, required: true },
    leaguePosition: { type: Number, required: true },
    points: { type: Number, default: 0 },
    goalsScored: { type: Number, default: 0 },
    goalsConceded: { type: Number, default: 0 },
    coachAssessment: { type: Number, min: 1, max: 10, required: true },
    totalTeams: { type: Number, default: 12 },
    maxPoints: { type: Number, default: 66 },
    upcoming: { type: Boolean, default: false }, // flags next fixture opponent
  },
  { timestamps: true },
);

export default mongoose.models.Opponent ||
  mongoose.model("Opponent", OpponentSchema);
