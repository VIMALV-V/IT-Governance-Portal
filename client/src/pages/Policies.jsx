import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { FiPlus, FiX, FiFileText, FiLoader } from "react-icons/fi";

function Policies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", version: "1.0", status: "Active" });
  const [errors, setErrors] = useState({});
  const role = localStorage.getItem("role");

  const fetchPolicies = async () => {
    try {
      const res = await API.get("/policies");
      setPolicies(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    return e;
  };

  const createPolicy = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSubmitting(true);
    try {
      await API.post("/policies", form);
      setForm({ title: "", description: "", version: "1.0", status: "Active" });
      setErrors({});
      setShowForm(false);
      fetchPolicies();
    } catch {
      alert("Policy creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "title", label: "Policy Title", render: (row) => (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FiFileText size={14} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{row.title}</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{row.description?.substring(0, 60)}{row.description?.length > 60 ? "..." : ""}</div>
        </div>
      </div>
    )},
    { key: "version", label: "Version", render: (row) => <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "var(--text-secondary)" }}>v{row.version}</span> },
    { key: "status", label: "Status" },
    { key: "createdBy", label: "Created By", render: (row) => (
      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{row.createdBy?.name || "-"}</span>
    )},
  ];

  return (
    <Layout>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Policies</h1>
          <p>Manage and review all governance policies.</p>
        </div>
        {(role === "Admin" || role === "Manager") && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <FiPlus size={15} /> New Policy
          </button>
        )}
      </div>

      {/* Create Policy Modal */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)",
          animation: "fadeIn 0.15s ease",
        }}>
          <div className="card" style={{ width: "480px", padding: "28px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>Create New Policy</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={createPolicy} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Policy Title *
                </label>
                <input className="input-field" placeholder="e.g. Data Retention Policy" value={form.title}
                  onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: "" }); }} />
                {errors.title && <p style={{ fontSize: "12px", color: "var(--danger)", marginTop: "4px" }}>{errors.title}</p>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Description *
                </label>
                <textarea className="input-field" rows={3} placeholder="Describe the policy..." value={form.description}
                  style={{ resize: "vertical" }}
                  onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: "" }); }} />
                {errors.description && <p style={{ fontSize: "12px", color: "var(--danger)", marginTop: "4px" }}>{errors.description}</p>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Version</label>
                  <input className="input-field" placeholder="1.0" value={form.version}
                    onChange={(e) => setForm({ ...form, version: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Status</label>
                  <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Active</option>
                    <option>Archived</option>
                    <option>Draft</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (
                    <><FiLoader size={14} style={{ animation: "spin 1s linear infinite" }} /> Creating...</>
                  ) : (
                    <><FiPlus size={14} /> Create Policy</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: "24px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: "48px", borderRadius: "8px" }} />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={policies}
            searchKeys={["title", "description", "status"]}
            emptyMessage="No policies found. Create your first policy."
          />
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
}

export default Policies;
