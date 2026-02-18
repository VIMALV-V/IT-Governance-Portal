const express = require("express");
const { getAuditLogs } = require("../controllers/auditController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Only Admin & Auditor can view logs
router.get(
  "/",
  protect,
  authorizeRoles("Admin", "Auditor"),
  getAuditLogs
);

module.exports = router;
