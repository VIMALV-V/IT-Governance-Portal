const express = require("express");
const { getAuditLogs } = require("../controllers/auditController");
const { protect, authorizePermissions } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../constants/permissions");

const router = express.Router();

router.get("/", protect, authorizePermissions(PERMISSIONS.VIEW_AUDIT_LOGS), getAuditLogs);

module.exports = router;
