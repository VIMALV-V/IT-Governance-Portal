import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiClipboard,
  FiBell,
  FiAlertTriangle,
  FiLogOut,
  FiShield,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiCheckSquare,
  FiBookOpen,
  FiUsers,
  FiKey,
} from "react-icons/fi";
import { getCurrentPermissions } from "./PermissionGuard";

function Sidebar({ collapsed, setCollapsed, mobileOpen = false, setMobileOpen = () => {}, isMobile = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");
  const permissions = getCurrentPermissions();

  const navGroups = [
    {
      label: "Governance",
      items: [
        { path: "/dashboard", icon: FiHome, label: "Dashboard" },
        { path: "/policies", icon: FiFileText, label: "Policies", permissions: ["view_data"] },
        { path: "/controls", icon: FiCheckSquare, label: "Controls", permissions: ["view_data"] },
        { path: "/risks", icon: FiAlertTriangle, label: "Risks", permissions: ["view_data"] },
        { path: "/audit-logs", icon: FiBookOpen, label: "Audit Logs", permissions: ["view_audit_logs"], roles: ["Admin", "Manager", "Auditor"] },
      ],
    },
    {
      label: "Operations",
      items: [
        { path: "/requests", icon: FiClipboard, label: "Requests", permissions: ["view_data"] },
        { path: "/notifications", icon: FiBell, label: "Notifications", permissions: ["view_data"] },
      ],
    },
    {
      label: "Administration",
      items: [
        { path: "/admin/users", icon: FiUsers, label: "Users", roles: ["Admin"], permissions: ["manage_users"] },
        { path: "/admin/roles", icon: FiKey, label: "Roles & Permissions", roles: ["Admin"], permissions: ["manage_roles"] },
      ],
    },
  ];

  const hasPermissions = (required = []) => required.every((permission) => permissions.includes(permission));

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const roleAllowed = !item.roles || item.roles.includes(role);
        const permissionAllowed = !item.permissions || hasPermissions(item.permissions);
        return roleAllowed && permissionAllowed;
      }),
    }))
    .filter((group) => group.items.length > 0);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("roles");
    localStorage.removeItem("permissions");
    window.location.href = "/";
  };

  const isActive = (path) => location.pathname === path;

  const sidebarStyle = {
    width: isMobile ? "252px" : collapsed ? "64px" : "252px",
    background: "var(--sidebar-bg)",
    height: isMobile ? "100dvh" : "100vh",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    flexShrink: 0,
    position: isMobile ? "fixed" : "sticky",
    top: 0,
    left: 0,
    overflowX: "hidden",
    overflowY: "auto",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    zIndex: 45,
    transform: isMobile ? (mobileOpen ? "translateX(0)" : "translateX(-110%)") : "none",
    boxShadow: isMobile && mobileOpen ? "0 18px 48px rgba(0, 0, 0, 0.35)" : "none",
  };

  return (
    <aside style={sidebarStyle} aria-label="Sidebar navigation">
      <div
        style={{
          padding: collapsed && !isMobile ? "20px 0" : "20px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed && !isMobile ? "center" : "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          minHeight: "64px",
        }}
      >
        {(isMobile || !collapsed) && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "30px", height: "30px", background: "linear-gradient(135deg, #2f6feb, #0ea5e9)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FiShield size={16} color="white" />
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: "15px", whiteSpace: "nowrap", letterSpacing: "-0.2px" }}>IT Governance</span>
          </div>
        )}
        {!isMobile && collapsed && (
          <div style={{ width: "30px", height: "30px", background: "linear-gradient(135deg, #2f6feb, #0ea5e9)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiShield size={16} color="white" />
          </div>
        )}
        {!isMobile && !collapsed && (
          <button aria-label="Collapse sidebar" onClick={() => setCollapsed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sidebar-text)", padding: "4px", borderRadius: "4px", display: "flex", alignItems: "center" }}>
            <FiChevronLeft size={16} />
          </button>
        )}
      </div>

      <nav style={{ flex: 1, padding: collapsed && !isMobile ? "12px 0" : "12px", overflowY: "auto" }}>
        {visibleGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: "24px" }}>
            {(isMobile || !collapsed) && (
              <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", padding: "0 8px", marginBottom: "6px" }}>
                {group.label}
              </div>
            )}
            {group.items.map(({ path, icon: Icon, label }) => (
              <button
                key={path}
                onClick={() => {
                  navigate(path);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                title={!isMobile && collapsed ? label : undefined}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: !isMobile && collapsed ? "10px 0" : "9px 10px",
                  justifyContent: !isMobile && collapsed ? "center" : "flex-start",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: "2px",
                  background: isActive(path) ? "var(--sidebar-active-bg)" : "transparent",
                  color: isActive(path) ? "var(--sidebar-active)" : "var(--sidebar-text)",
                  fontSize: "14px",
                  fontWeight: isActive(path) ? 600 : 400,
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s ease",
                  position: "relative",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(path)) {
                    e.currentTarget.style.background = "var(--sidebar-hover)";
                    e.currentTarget.style.color = "#c8d0e0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(path)) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--sidebar-text)";
                  }
                }}
              >
                {isActive(path) && (
                  <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "18px", background: "#2f6feb", borderRadius: "0 3px 3px 0" }} />
                )}
                <Icon size={16} style={{ flexShrink: 0 }} />
                {(isMobile || !collapsed) && <span>{label}</span>}
              </button>
            ))}
          </div>
        ))}

        {(isMobile || !collapsed) && (
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", padding: "0 8px", marginBottom: "6px" }}>System</div>
        )}
        <button
          title={!isMobile && collapsed ? "Logout" : undefined}
          onClick={logout}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: !isMobile && collapsed ? "10px 0" : "9px 10px", justifyContent: !isMobile && collapsed ? "center" : "flex-start", borderRadius: "8px", border: "none", cursor: "pointer", background: "transparent", color: "#ef4444", fontSize: "14px", fontWeight: 400, fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s ease" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <FiLogOut size={16} style={{ flexShrink: 0 }} />
          {(isMobile || !collapsed) && <span>Logout</span>}
        </button>
      </nav>

      <div style={{ padding: !isMobile && collapsed ? "16px 0" : "16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: !isMobile && collapsed ? "center" : "space-between", gap: "10px" }}>
        {!isMobile && collapsed ? (
          <button aria-label="Expand sidebar" onClick={() => setCollapsed(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sidebar-text)", padding: "4px", borderRadius: "4px", display: "flex", alignItems: "center" }}>
            <FiChevronRight size={16} />
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #2f6feb, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FiUser size={14} color="white" />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "13px", color: "#e0e6f0", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{localStorage.getItem("userName") || "User"}</div>
              <div style={{ fontSize: "11px", color: "var(--sidebar-text)" }}>{role}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
