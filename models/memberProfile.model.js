const mongoose = require("mongoose");

const memberProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relationship: { type: String, default: "" },
    },
    experienceLevel: {
      type: String,
      enum: ["new", "developing", "experienced", "veteran"],
      default: "new",
    },
    secondaryVoicePart: {
      type: String,
      enum: ["Soprano", "Alto", "Tenor", "Bass", "Other", ""],
      default: "",
    },
    canReadMusic: { type: Boolean, default: false },
    instruments: [{ type: String, trim: true }],
    availability: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: true },
    },
    joinedAt: { type: Date },
    bio: { type: String, default: "", maxlength: 1000 },
    goals: { type: String, default: "", maxlength: 500 },
    directorNotes: { type: String, default: "", maxlength: 2000 },
    attendanceStreak: { type: Number, default: 0 },
    lastAttendanceAt: { type: Date },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

memberProfileSchema.index({ experienceLevel: 1 });
memberProfileSchema.index({ "availability.sunday": 1 });

module.exports = mongoose.model("MemberProfile", memberProfileSchema);
