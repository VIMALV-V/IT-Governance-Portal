import React from "react";

function StatCard({ title, value, icon: Icon, color = "#4f6ef7", subtitle, trend }) {
  const colorMap = {
    blue: { bg: "linear-gradient(135deg, #4f6ef7, #6b87f8)", light: "#eef1fe", text: "#4f6ef7" },
    green: { bg: "linear-gradient(135deg, #10b981, #34d399)", light: "#ecfdf5", text: "#10b981" },
    amber: { bg: "linear-gradient(135deg, #f59e0b, #fbbf24)", light: "#fffbeb", text: "#f59e0b" },
    cyan: { bg: "linear-gradient(135deg, #0ea5e9, #22d3ee)", light: "#ecfeff", text: "#0284c7" },
    red: { bg: "linear-gradient(135deg, #ef4444, #f87171)", light: "#fef2f2", text: "#ef4444" },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className="card"
      style={{ padding: "20px", cursor: "default", position: "relative", overflow: "hidden" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div style={{
        position: "absolute", top: "-20px", right: "-20px",
        width: "80px", height: "80px",
        borderRadius: "50%",
        background: c.bg,
        opacity: 0.08,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{
          width: "40px", height: "40px",
          borderRadius: "10px",
          background: c.light,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {Icon && <Icon size={18} style={{ color: c.text }} />}
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: "12px", fontWeight: 500,
            color: trend >= 0 ? "#10b981" : "#ef4444",
            background: trend >= 0 ? "#ecfdf5" : "#fef2f2",
            padding: "2px 8px", borderRadius: "12px",
          }}>
            {trend >= 0 ? "Up" : "Down"} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div>
        <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {title}
        </div>
        <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px", lineHeight: 1 }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "6px" }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
