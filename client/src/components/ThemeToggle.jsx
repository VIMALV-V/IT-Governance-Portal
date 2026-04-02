import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      style={{
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
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--accent-light)";
        e.currentTarget.style.color = "var(--accent)";
        e.currentTarget.style.borderColor = "var(--accent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--bg-tertiary)";
        e.currentTarget.style.color = "var(--text-secondary)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {theme === "dark" ? <FiSun size={16} /> : <FiMoon size={16} />}
    </button>
  );
}

export default ThemeToggle;