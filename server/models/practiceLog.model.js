const mongoose = require("mongoose");

const practiceLogSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    song: { type: mongoose.Schema.Types.ObjectId, ref: "Song" },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "ChoirEvent" },
    practicedAt: { type: Date, default: Date.now },
    durationMinutes: { type: Number, required: true, min: 5, max: 480 },
    focusArea: {
      type: String,
      enum: ["pitch", "rhythm", "dynamics", "memorization", "blend", "general"],
      default: "general",
    },
    selfRating: { type: Number, min: 1, max: 5, default: 3 },
    notes: { type: String, default: "", maxlength: 2000 },
    voicePart: {
      type: String,
      enum: ["Soprano", "Alto", "Tenor", "Bass", "Other"],
    },
    sharedWithDirector: { type: Boolean, default: false },
  },
  { timestamps: true }
);

practiceLogSchema.index({ member: 1, practicedAt: -1 });
practiceLogSchema.index({ song: 1, practicedAt: -1 });
practiceLogSchema.index({ sharedWithDirector: 1, practicedAt: -1 });

module.exports = mongoose.model("PracticeLog", practiceLogSchema);
