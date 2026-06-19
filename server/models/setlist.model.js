const mongoose = require("mongoose");

const setlistItemSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true, min: 1 },
    song: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
    keyOverride: { type: String, default: "" },
    notes: { type: String, default: "" },
    estimatedMinutes: { type: Number, default: 5, min: 1, max: 60 },
    soloist: { type: String, default: "" },
    voicePartFocus: {
      type: String,
      enum: ["Soprano", "Alto", "Tenor", "Bass", "Full", "Other", ""],
      default: "",
    },
  },
  { _id: false }
);

const setlistSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "ChoirEvent" },
    description: { type: String, default: "" },
    items: [setlistItemSchema],
    status: {
      type: String,
      enum: ["draft", "review", "approved", "archived"],
      default: "draft",
    },
    totalEstimatedMinutes: { type: Number, default: 0 },
    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    tags: [{ type: String, trim: true }],
    isTemplate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

setlistSchema.index({ title: "text", description: "text" });
setlistSchema.index({ status: 1, updatedAt: -1 });
setlistSchema.index({ event: 1 });

setlistSchema.pre("save", function recalcDuration() {
  this.totalEstimatedMinutes = (this.items || []).reduce(
    (sum, item) => sum + (item.estimatedMinutes || 0),
    0
  );
});

module.exports = mongoose.model("Setlist", setlistSchema);
