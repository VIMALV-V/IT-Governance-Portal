const mongoose = require("mongoose");

const riskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low"
    },
    mitigation: {
      type: String
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Risk", riskSchema);
