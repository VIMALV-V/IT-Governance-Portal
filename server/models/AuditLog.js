const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: {
      type: String,
      default: "System",
    },
    roles: {
      type: [String],
      default: [],
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    module: {
      type: String,
      default: "General",
      trim: true,
    },
    source: {
      type: String,
      enum: ["manual", "auto", "system"],
      default: "manual",
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "",
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1, action: 1, module: 1, source: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
