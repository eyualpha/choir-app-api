const mongoose = require("mongoose");

const attendanceRecordSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChoirEvent",
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "late", "excused", "absent"],
      default: "present",
    },
    checkedInAt: { type: Date, default: Date.now },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

attendanceRecordSchema.index({ event: 1, member: 1 }, { unique: true });
attendanceRecordSchema.index({ member: 1, createdAt: -1 });

module.exports = mongoose.model("AttendanceRecord", attendanceRecordSchema);
