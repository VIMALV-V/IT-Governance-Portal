import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiUser, FiMenu } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";
import API from "../api/api";

const titleMap = {
  dashboard: "Dashboard",
  policies: "Policies",
  controls: "Controls",
  requests: "Requests",
  notifications: "Notifications",
  risks: "Risks",
  "audit-logs": "Audit Logs",
  "admin/users": "Admin Users",
  "admin/roles": "Role Management",
};

function Navbar({ theme, toggleTheme, notificationCount = 0, onToggleSidebar, showMenuButton = false }) {
  const [searchVal, setSearchVal] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName") || "User";
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = useMemo(() => {
    const key = location.pathname.replace(/^\//, "");
    return titleMap[key] || "IT Governance";
  }, [location.pathname]);

  const breadcrumbs = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) {
      return ["Home"];
    }

    const mapped = parts.map((part) => part.replace(/-/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase()));
    return ["Home", ...mapped];
  }, [location.pathname]);

  const runSearch = async (value) => {
    setSearchVal(value);
    if (value.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }
    try {
      const response = await API.get(`/search?q=${encodeURIComponent(value.trim())}`);
      const combined = [
        ...(response.data.policies || []).map((item) => ({ ...item, type: "Policy", path: "/policies" })),
        ...(response.data.requests || []).map((item) => ({ ...item, type: "Request", path: "/requests" })),
        ...(response.data.risks || []).map((item) => ({ ...item, type: "Risk", path: "/risks" })),
      ];
      setResults(combined.slice(0, 8));
      setShowResults(true);
    } catch {
      setResults([]);
      setShowResults(false);
    }
  };

  return (
    <header
      style={{
        minHeight: "64px",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        gap: "16px",
        position: "sticky",
        top: 0,
        zIndex: 20,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          aria-label="Toggle menu"
          className="navbar-menu-btn"
          onClick={onToggleSidebar}
          style={{ display: showMenuButton ? "inline-flex" : "none" }}
        >
          <FiMenu size={16} />
        </button>
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.2px", margin: 0 }}>{pageTitle}</h2>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{breadcrumbs.join(" / ")}</div>
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: "420px", minWidth: "220px", position: "relative" }}>
        <FiSearch
          size={15}
          style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}
        />
        <input
          aria-label="Search policies, requests, and risks"
          className="input-field"
          style={{ paddingLeft: "36px", fontSize: "13px" }}
          placeholder="Search policies, requests, risks"
          value={searchVal}
          onChange={(e) => runSearch(e.target.value)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
          onFocus={() => results.length && setShowResults(true)}
        />

        {showResults && (
          <div className="card" style={{ position: "absolute", top: "44px", left: 0, right: 0, padding: "8px", zIndex: 40 }}>
            {results.length === 0 ? (
              <div style={{ padding: "10px", fontSize: "13px", color: "var(--text-muted)" }}>No matches found</div>
            ) : (
              results.map((item) => (
                <button
                  key={`${item.type}-${item._id}`}
                  onClick={() => {
                    navigate(item.path);
                    setShowResults(false);
                  }}
                  style={{ width: "100%", border: "none", background: "transparent", textAlign: "left", padding: "10px", borderRadius: "8px", cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-tertiary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500 }}>{item.title}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.type}</div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

        <button
          aria-label="Open notifications"
          onClick={() => navigate("/notifications")}
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            border: "1.5px solid var(--border)",
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <FiBell size={16} />
          {notificationCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "#ef4444",
                color: "white",
                fontSize: "10px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--bg-secondary)",
              }}
            >
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px 6px 6px", borderRadius: "8px", border: "1.5px solid var(--border)", background: "var(--bg-tertiary)" }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "linear-gradient(135deg, #2f6feb, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiUser size={13} color="white" />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.2 }}>{userName}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: 1 }}>{role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
