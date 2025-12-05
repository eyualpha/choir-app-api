const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    type: {
      type: String,
      enum: ["lyrics", "pdf", "audio", "video"],
      required: true,
    },

    file: {
      url: String,
      public_id: String,
      mimeType: String,
      size: Number,
    },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
