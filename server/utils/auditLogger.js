const AuditLog = require("../models/AuditLog");

const logAudit = async (userId, action, resource) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      resource
    });
  } catch (error) {
    console.error("Audit logging failed:", error.message);
  }
};

module.exports = logAudit;
