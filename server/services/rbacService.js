const Role = require("../models/Role");
const { PERMISSIONS, ALL_PERMISSIONS } = require("../constants/permissions");

const defaultRoles = [
  {
    name: "Admin",
    description: "Full system access",
    permissions: ALL_PERMISSIONS,
    isSystem: true,
  },
  {
    name: "Manager",
    description: "Operational and governance management",
    permissions: [
      PERMISSIONS.VIEW_DATA,
      PERMISSIONS.EDIT_DATA,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.EXPORT_REPORTS,
    ],
    isSystem: true,
  },
  {
    name: "Auditor",
    description: "Read-only oversight and evidence export",
    permissions: [
      PERMISSIONS.VIEW_DATA,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.EXPORT_REPORTS,
    ],
    isSystem: true,
  },
  {
    name: "Employee",
    description: "Standard end-user access",
    permissions: [PERMISSIONS.VIEW_DATA],
    isSystem: true,
  },
];

const ensureDefaultRoles = async () => {
  const existingCount = await Role.countDocuments();
  if (existingCount > 0) {
    return;
  }
  await Role.insertMany(defaultRoles);
};

module.exports = { ensureDefaultRoles, defaultRoles };
