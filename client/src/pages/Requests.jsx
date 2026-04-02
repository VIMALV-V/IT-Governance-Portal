import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import { FiPlus, FiX, FiCheckCircle, FiXCircle, FiLoader, FiClipboard } from "react-icons/fi";

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState({});
  const [form, setForm] = useState({ title: "", description: "" });
  const [errors, setErrors] = useState({});
  const role = localStorage.getItem("role");

  const fetchRequests = async () => {
    try {
      const endpoint = role === "Employee" ? "/requests/my" : "/requests";
      const res = await API.get(endpoint);
      setRequests(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const submitRequest = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.description.trim()) errs.description = "Description is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await API.post("/requests", form);
      setForm({ title: "", description: "" });
      setErrors({});
      setShowForm(false);
      fetchRequests();
    } catch {
      alert("Request submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const reviewRequest = async (id, status) => {
    setReviewing((prev) => ({ ...prev, [id]: status }));
    try {
      await API.put(`/requests/${id}`, { status });
      fetchRequests();
    } catch {
      alert("Action failed");
    } finally {
      setReviewing((prev) => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const columns = [
    { key: "title", label: "Request", render: (row) => (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FiClipboard size={14} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{row.title}</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{row.description?.substring(0, 55)}{row.description?.length > 55 ? "..." : ""}</div>
        </div>
      </div>
    )},
    { key: "submittedBy", label: "Submitted By", render: (row) => (
      <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{row.submittedBy?.name || "You"}</span>
    )},
    { key: "status", label: "Status" },
    { key: "reviewedAt", label: "Reviewed", render: (row) => (
      <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
        {row.reviewedAt ? new Date(row.reviewedAt).toLocaleDateString() : "-"}
      </span>
    )},
    ...(role === "Admin" || role === "Manager" ? [{
      key: "actions", label: "Actions", sortable: false,
      render: (row) => row.status === "Pending" ? (
        <div style={{ display: "flex", gap: "6px" }}>
          <button className="btn-success"
            disabled={reviewing[row._id]}
            onClick={() => reviewRequest(row._id, "Approved")}>
            {reviewing[row._id] === "Approved" ? <FiLoader size={13} style={{ animation: "spin 1s linear infinite" }} /> : <FiCheckCircle size={13} />}
            Approve
          </button>
          <button className="btn-danger"
            disabled={reviewing[row._id]}
            onClick={() => reviewRequest(row._id, "Rejected")}>
            {reviewing[row._id] === "Rejected" ? <FiLoader size={13} style={{ animation: "spin 1s linear infinite" }} /> : <FiXCircle size={13} />}
            Reject
          </button>
        </div>
      ) : <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Reviewed</span>
    }] : []),
  ];

  return (
    <Layout>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px" }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Requests</h1>
          <p>{role === "Employee" ? "Submit and track your governance requests." : "Review and manage all submitted requests."}</p>
        </div>
        {role === "Employee" && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <FiPlus size={15} /> New Request
          </button>
        )}
      </div>

      {/* Submit Modal */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)", animation: "fadeIn 0.15s ease",
        }}>
          <div className="card" style={{ width: "460px", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>Submit New Request</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><FiX size={18} /></button>
            </div>
            <form onSubmit={submitRequest} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Request Title *</label>
                <input className="input-field" placeholder="Brief title for your request" value={form.title}
                  onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: "" }); }} />
                {errors.title && <p style={{ fontSize: "12px", color: "var(--danger)", marginTop: "4px" }}>{errors.title}</p>}
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>Description *</label>
                <textarea className="input-field" rows={4} placeholder="Describe what you need..." value={form.description}
                  style={{ resize: "vertical" }}
                  onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: "" }); }} />
                {errors.description && <p style={{ fontSize: "12px", color: "var(--danger)", marginTop: "4px" }}>{errors.description}</p>}
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? <><FiLoader size={14} style={{ animation: "spin 1s linear infinite" }} /> Submitting...</> : <><FiPlus size={14} /> Submit Request</>}
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
            data={requests}
            searchKeys={["title", "description", "status"]}
            emptyMessage="No requests found. Submit your first request."
          />
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
}

export default Requests;
