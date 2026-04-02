import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { FiPlus, FiX, FiAlertTriangle, FiLoader } from "react-icons/fi";

function Risks() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", severity: "Low", mitigation: "" });
  const [errors, setErrors] = useState({});
  const role = localStorage.getItem("role");

  const fetchRisks = async () => {
    try {
      const res = await API.get("/risks");
      setRisks(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRisks(); }, []);

  const createRisk = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await API.post("/risks", form);
      setForm({ title: "", description: "", severity: "Low", mitigation: "" });
      setErrors({});
      setShowForm(false);
      fetchRisks();
    } catch {
      alert("Risk creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/risks/${id}`, { status });
      fetchRisks();
    } catch {
      alert("Update failed");
    }
  };

  const columns = [
    { key: "title", label: "Risk", render: (row) => (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--danger-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FiAlertTriangle size={14} style={{ color: "var(--danger)" }} />
        </div>
        <div>
          <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{row.title}</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{row.description?.substring(0, 55)}{row.description?.length > 55 ? "..." : ""}</div>
        </div>
      </div>
    )},
    { key: "severity", label: "Severity" },
    { key: "status", label: "Status" },
    { key: "mitigation", label: "Mitigation", render: (row) => (
      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{row.mitigation || "-"}</span>
    )},
    { key: "createdBy", label: "Owner", render: (row) => (
      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{row.createdBy?.name || "-"}</span>
    )},
    ...(role === "Admin" || role === "Manager" ? [{
      key: "actions", label: "Actions", sortable: false,
      render: (row) => row.status !== "Resolved" ? (
        <div style={{ display: "flex", gap: "6px" }}>
          {row.status === "Open" && (
            <button className="btn-secondary" style={{ padding: "5px 10px", fontSize: "12px" }}
              onClick={() => updateStatus(row._id, "In Progress")}>
              Move to In Progress
            </button>
          )}
          {row.status !== "Resolved" && (
            <button className="btn-success" style={{ padding: "5px 10px", fontSize: "12px" }}
              onClick={() => updateStatus(row._id, "Resolved")}>
              Resolve
            </button>
          )}
        </div>
      ) : <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Resolved</span>
    }] : []),
  ];

  return (
    <Layout>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Risk Management</h1>
          <p>Track and mitigate organizational risks.</p>
        </div>
        {(role === "Admin" || role === "Manager") && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <FiPlus size={15} /> Log Risk
          </button>
        )}
      </div>

      {showForm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)", animation: "fadeIn 0.15s ease",
        }}>
          <div className="card" style={{ width: "500px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>Log New Risk</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><FiX size={18} /></button>
            </div>
            <form onSubmit={createRisk} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Risk Title *</label>
                <input className="input-field" placeholder="e.g. Unauthorized Data Access" value={form.title}
                  onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: "" }); }} />
                {errors.title && <p style={{ fontSize: "12px", color: "var(--danger)", marginTop: "4px" }}>{errors.title}</p>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Description *</label>
                <textarea className="input-field" rows={3} placeholder="Describe the risk..." value={form.description}
                  style={{ resize: "vertical" }}
                  onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: "" }); }} />
                {errors.description && <p style={{ fontSize: "12px", color: "var(--danger)", marginTop: "4px" }}>{errors.description}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Severity</label>
                  <select className="input-field" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                    <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Mitigation Plan</label>
                  <input className="input-field" placeholder="Brief mitigation strategy" value={form.mitigation}
                    onChange={(e) => setForm({ ...form, mitigation: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <><FiLoader size={14} style={{ animation: "spin 1s linear infinite" }} /> Logging...</> : <><FiPlus size={14} /> Log Risk</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: "24px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: "48px", borderRadius: "8px" }} />)}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={risks}
            searchKeys={["title", "description", "severity", "status"]}
            emptyMessage="No risks logged. Start by logging a risk."
          />
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
}

export default Risks;
