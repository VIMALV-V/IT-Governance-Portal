import React from "react";

const FALLBACK_ROLE_PERMISSIONS = {
  Admin: [
    "view_data",
    "edit_data",
    "delete_records",
    "manage_users",
    "manage_roles",
    "view_audit_logs",
    "export_reports",
  ],
  Manager: ["view_data", "edit_data", "view_audit_logs", "export_reports"],
  Auditor: ["view_data", "view_audit_logs", "export_reports"],
  Employee: ["view_data"],
};

const parseLocal = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

export const getCurrentPermissions = () => {
  const permissions = parseLocal("permissions", []);
  if (permissions.length > 0) {
    return permissions;
  }

  const role = localStorage.getItem("role") || "Employee";
  return FALLBACK_ROLE_PERMISSIONS[role] || [];
};

function PermissionGuard({ permissions = [], mode = "all", fallback = null, children }) {
  if (!permissions.length) {
    return children;
  }

  const currentPermissions = getCurrentPermissions();

  const allowed =
    mode === "any"
      ? permissions.some((permission) => currentPermissions.includes(permission))
      : permissions.every((permission) => currentPermissions.includes(permission));

  if (!allowed) {
    return fallback;
  }

  return children;
}

export default PermissionGuard;
