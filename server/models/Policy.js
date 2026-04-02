const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    version: {
      type: String,
      default: "1.0"
    },
    status: {
      type: String,
      enum: ["Draft", "Active", "Archived"],
      default: "Draft"
    },
    versionHistory: [
      {
        version: String,
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changes: String
      }
    ],
    attachments: [
      {
        filename: String,
        url: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Policy", policySchema);
