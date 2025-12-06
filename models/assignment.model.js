const mongoose = require("mongoose");

const choirAssignmentSchema = new mongoose.Schema(
  {
    leadSingers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    backupSingers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    prayerTeam: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ChoirAssignment = mongoose.model(
  "ChoirAssignment",
  choirAssignmentSchema
);
module.exports = ChoirAssignment;
