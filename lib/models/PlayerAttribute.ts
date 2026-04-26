import mongoose, { Schema } from "mongoose";

const PlayerAttributeSchema = new Schema(
  {
    playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    weekOf: { type: String, required: true }, // ISO date string, e.g. "2025-10-07"
    physical: { type: Number, min: 1, max: 10, required: true },
    technical: { type: Number, min: 1, max: 10, required: true },
    tactical: { type: Number, min: 1, max: 10, required: true },
    mental: { type: Number, min: 1, max: 10, required: true },
  },
  { timestamps: true },
);

// Compound index: one assessment per player per week
PlayerAttributeSchema.index({ playerId: 1, weekOf: 1 }, { unique: true });

export default mongoose.models.PlayerAttribute ||
  mongoose.model("PlayerAttribute", PlayerAttributeSchema);
