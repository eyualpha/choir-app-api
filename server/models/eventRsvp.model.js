const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema(
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
      enum: ["attending", "not_attending", "maybe"],
      required: true,
    },
    note: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

rsvpSchema.index({ event: 1, member: 1 }, { unique: true });
rsvpSchema.index({ event: 1, status: 1 });

module.exports = mongoose.model("EventRsvp", rsvpSchema);
