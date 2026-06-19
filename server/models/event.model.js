const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    eventType: {
      type: String,
      enum: ["rehearsal", "performance", "meeting", "outreach", "recording"],
      default: "rehearsal",
    },
    location: { type: String, default: "" },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    requiredVoiceParts: [
      { type: String, enum: ["Soprano", "Alto", "Tenor", "Bass", "Other"] },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, default: "" },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

eventSchema.index({ startAt: 1, status: 1 });
eventSchema.index({ eventType: 1, startAt: -1 });

module.exports = mongoose.model("ChoirEvent", eventSchema);
