export function useAuth() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName") || "User";
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");

  const isAdmin = roles.includes("Admin") || role === "Admin";
  const isManager = roles.includes("Manager") || role === "Manager";
  const isEmployee = roles.includes("Employee") || role === "Employee";
  const isAuditor = roles.includes("Auditor") || role === "Auditor";
  const isAdminOrManager = isAdmin || isManager;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("roles");
    localStorage.removeItem("permissions");
    localStorage.removeItem("userName");
  };

  return {
    token,
    role,
    userName,
    roles,
    permissions,
    isAdmin,
    isManager,
    isEmployee,
    isAuditor,
    isAdminOrManager,
    logout,
  };
}
