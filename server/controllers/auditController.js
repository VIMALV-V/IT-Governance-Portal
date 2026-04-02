const AuditLog = require("../models/AuditLog");

const getAuditLogs = async (req, res) => {
  try {
    const { userId, action, module, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const filters = {};
    if (userId) filters.user = userId;
    if (action) filters.action = { $regex: action, $options: "i" };
    if (module) filters.module = { $regex: module, $options: "i" };
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filters.createdAt.$lte = new Date(dateTo);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      AuditLog.find(filters)
        .populate("user", "name email role")
        .populate("targetUser", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AuditLog.countDocuments(filters),
    ]);

    res.json({
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAuditLogs };
