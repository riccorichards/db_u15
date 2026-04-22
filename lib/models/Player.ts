import mongoose, { Schema } from "mongoose";

const PlayerSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    number: { type: Number, required: true, unique: true },
    position: {
      type: String,
      enum: ["GK", "DEF", "MID", "FWD"],
      required: true,
    },
    avatarKey: { type: String, default: "default" },
    gamesPlayed: { type: Number, default: 0 },
    minutesPlayed: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    mvpCount: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    ratings: { type: [Number], default: [] },
    cleanSheets: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Player || mongoose.model("Player", PlayerSchema);
