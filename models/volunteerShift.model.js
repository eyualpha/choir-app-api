const mongoose = require("mongoose");

const volunteerShiftSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "ChoirEvent" },
    role: {
      type: String,
      enum: ["usher", "sound", "projection", "greeter", "setup", "cleanup", "other"],
      required: true,
    },
    description: { type: String, default: "" },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    slots: { type: Number, required: true, min: 1, max: 50 },
    assignedMembers: [
      {
        member: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["confirmed", "pending", "declined"],
          default: "pending",
        },
        assignedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

volunteerShiftSchema.index({ startAt: 1, isActive: 1 });
volunteerShiftSchema.index({ "assignedMembers.member": 1 });

volunteerShiftSchema.virtual("filledSlots").get(function filledSlots() {
  return (this.assignedMembers || []).filter((entry) => entry.status === "confirmed").length;
});

volunteerShiftSchema.virtual("openSlots").get(function openSlots() {
  return Math.max(this.slots - this.filledSlots, 0);
});

volunteerShiftSchema.set("toJSON", { virtuals: true });
volunteerShiftSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("VolunteerShift", volunteerShiftSchema);
