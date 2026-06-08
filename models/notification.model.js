const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    category: {
      type: String,
      enum: ["assignment", "event", "announcement", "system", "attendance"],
      default: "system",
    },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
