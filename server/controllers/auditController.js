const AuditLog = require("../models/AuditLog");

// GET ALL AUDIT LOGS
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    res.json(logs);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAuditLogs };
