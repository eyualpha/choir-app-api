const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    passwordHash: { type: String, required: true },

    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },

    voicePart: {
      type: String,
      enum: ["Soprano", "Alto", "Tenor", "Bass", "Other"],
      default: "Other",
    },

    profile: {
      url: String,
      public_id: String,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
