const mongoose = require("mongoose");

const voicePartSchema = new mongoose.Schema(
  {
    part: {
      type: String,
      enum: ["Soprano", "Alto", "Tenor", "Bass"],
      required: true,
    },
    fileUrl: String,
    publicId: String,
    notes: String,
  },
  { _id: false }
);

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    composer: { type: String, default: "" },
    arranger: { type: String, default: "" },
    lyricsLanguage: { type: String, default: "Amharic" },
    keySignature: { type: String, default: "C" },
    tempo: { type: String, default: "" },
    timeSignature: { type: String, default: "4/4" },
    category: {
      type: String,
      enum: ["worship", "hymn", "special", "seasonal", "practice"],
      default: "worship",
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
    },
    durationSeconds: { type: Number, default: 0 },
    lyrics: { type: String, default: "" },
    tags: [{ type: String }],
    voiceParts: [voicePartSchema],
    isActive: { type: Boolean, default: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastPerformedAt: { type: Date },
    performanceCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

songSchema.index({ title: "text", composer: "text", tags: "text" });
songSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model("Song", songSchema);
