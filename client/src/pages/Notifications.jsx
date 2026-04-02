import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import { FiBell, FiCheckCircle } from "react-icons/fi";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/notifications")
      .then((res) => setNotifications(res.data))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <h1>Notifications</h1>
        <p>Stay updated on policy changes and request approvals.</p>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div className="skeleton" style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: "14px", width: "70%", marginBottom: "6px" }} />
                  <div className="skeleton" style={{ height: "11px", width: "30%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            <FiBell size={36} style={{ marginBottom: "12px", opacity: 0.4 }} />
            <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
              You're all caught up!
            </div>
            <div style={{ fontSize: "13px" }}>No notifications at the moment.</div>
          </div>
        ) : (
          <div>
            {notifications.map((n, idx) => (
              <div
                key={n._id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "14px 0",
                  borderBottom: idx < notifications.length - 1 ? "1px solid var(--border)" : "none",
                  animation: `fadeIn 0.2s ease ${idx * 0.04}s both`,
                }}
              >
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "var(--accent-light)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <FiCheckCircle size={16} style={{ color: "var(--accent)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 400, lineHeight: 1.5 }}>
                    {n.message}
                  </div>
                  {n.createdAt && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </Layout>
  );
}

export default Notifications;