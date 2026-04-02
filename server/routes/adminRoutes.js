const express = require("express");
const {
  getUsers,
  updateUserAccess,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getAuditLogs,
  exportAuditLogsCsv,
  exportAuditLogsPdf,
} = require("../controllers/adminController");
const { protect, authorizePermissions, authorizeRoles } = require("../middleware/authMiddleware");
const { PERMISSIONS } = require("../constants/permissions");

const router = express.Router();

router.use(protect);

router.get("/users", authorizeRoles("Admin"), authorizePermissions(PERMISSIONS.MANAGE_USERS), getUsers);
router.patch("/users/:id/access", authorizeRoles("Admin"), authorizePermissions(PERMISSIONS.MANAGE_USERS), updateUserAccess);

router.get("/roles", authorizeRoles("Admin"), authorizePermissions(PERMISSIONS.MANAGE_ROLES), getRoles);
router.post("/roles", authorizeRoles("Admin"), authorizePermissions(PERMISSIONS.MANAGE_ROLES), createRole);
router.put("/roles/:id", authorizeRoles("Admin"), authorizePermissions(PERMISSIONS.MANAGE_ROLES), updateRole);
router.delete("/roles/:id", authorizeRoles("Admin"), authorizePermissions(PERMISSIONS.MANAGE_ROLES), deleteRole);

router.get("/audit-logs", authorizeRoles("Admin", "Manager", "Auditor"), authorizePermissions(PERMISSIONS.VIEW_AUDIT_LOGS), getAuditLogs);
router.get("/audit-logs/export/csv", authorizeRoles("Admin", "Manager", "Auditor"), authorizePermissions(PERMISSIONS.EXPORT_REPORTS), exportAuditLogsCsv);
router.get("/audit-logs/export/pdf", authorizeRoles("Admin", "Manager", "Auditor"), authorizePermissions(PERMISSIONS.EXPORT_REPORTS), exportAuditLogsPdf);

module.exports = router;
