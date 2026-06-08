const mongoose = require("mongoose");

const rehearsalItemSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
    focus: { type: String, default: "" },
    durationMinutes: { type: Number, default: 15 },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const rehearsalPlanSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChoirEvent",
      required: true,
      unique: true,
    },
    warmupNotes: { type: String, default: "" },
    cooldownNotes: { type: String, default: "" },
    objectives: [{ type: String }],
    items: [rehearsalItemSchema],
    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RehearsalPlan", rehearsalPlanSchema);
