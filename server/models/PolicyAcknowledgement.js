const mongoose = require("mongoose");

const acknowledgementSchema = new mongoose.Schema(
  {
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("PolicyAcknowledgement", acknowledgementSchema);
