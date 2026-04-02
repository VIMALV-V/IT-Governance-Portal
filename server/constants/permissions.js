const PERMISSIONS = {
  VIEW_DATA: "view_data",
  EDIT_DATA: "edit_data",
  DELETE_RECORDS: "delete_records",
  MANAGE_USERS: "manage_users",
  MANAGE_ROLES: "manage_roles",
  VIEW_AUDIT_LOGS: "view_audit_logs",
  EXPORT_REPORTS: "export_reports",
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

module.exports = { PERMISSIONS, ALL_PERMISSIONS };
