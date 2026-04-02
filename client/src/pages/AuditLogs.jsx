import React, { useEffect, useMemo, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import PermissionGuard from "../components/PermissionGuard";
import { FiDownload, FiFilter, FiRefreshCw, FiDatabase, FiZap, FiEdit3 } from "react-icons/fi";
import { toast } from "react-toastify";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: "", module: "", source: "", dateFrom: "", dateTo: "" });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const buildQuery = (nextPage) => {
    const params = new URLSearchParams({ page: String(nextPage), limit: "20" });
    if (filters.action) params.set("action", filters.action);
    if (filters.module) params.set("module", filters.module);
    if (filters.source) params.set("source", filters.source);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    return params;
  };

  const fetchLogs = async (nextPage = page) => {
    setLoading(true);
    try {
      const response = await API.get(`/admin/audit-logs?${buildQuery(nextPage).toString()}`);
      setLogs(response.data.data || []);
      setPagination(response.data.pagination || { pages: 1, total: 0 });
      setPage(nextPage);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const stats = useMemo(() => {
    const autoCount = logs.filter((item) => item.source === "auto").length;
    const manualCount = logs.filter((item) => item.source === "manual").length;
    const failedCount = logs.filter((item) => item.status === "failed").length;
    return { autoCount, manualCount, failedCount };
  }, [logs]);

  const downloadBlob = async (endpoint, fileName) => {
    const response = await API.get(endpoint, { responseType: "blob" });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportCsv = async () => {
    try {
      const query = buildQuery(1).toString();
      await downloadBlob(`/admin/audit-logs/export/csv?${query}`, `audit-logs-${Date.now()}.csv`);
      toast.success("CSV exported");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  const exportPdf = async () => {
    try {
      const query = buildQuery(1).toString();
      await downloadBlob(`/admin/audit-logs/export/pdf?${query}`, `audit-logs-${Date.now()}.pdf`);
      toast.success("PDF exported");
    } catch {
      toast.error("Failed to export PDF");
    }
  };

  const sourceBadge = (source) => {
    if (source === "auto") return <span className="badge-active">Auto</span>;
    if (source === "system") return <span className="badge-pending">System</span>;
    return <span className="badge-approved">Manual</span>;
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Audit Activity Center</h1>
        <p>Unified event trace across manual actions and automatic middleware events.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px", marginBottom: "14px" }}>
        <div className="card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}><FiDatabase /> Total Loaded</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{logs.length}</div>
        </div>
        <div className="card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}><FiZap /> Auto Logs</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{stats.autoCount}</div>
        </div>
        <div className="card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}><FiEdit3 /> Manual Logs</div>
          <div style={{ fontSize: "24px", fontWeight: 700 }}>{stats.manualCount}</div>
        </div>
        <div className="card" style={{ padding: "14px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Failed Events</div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: stats.failedCount > 0 ? "var(--danger)" : "var(--text-primary)" }}>{stats.failedCount}</div>
        </div>
      </div>

      <div className="card" style={{ padding: "16px", marginBottom: "14px", display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        <input className="input-field" placeholder="Action" value={filters.action} onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))} />
        <input className="input-field" placeholder="Module" value={filters.module} onChange={(e) => setFilters((prev) => ({ ...prev, module: e.target.value }))} />
        <select className="input-field" value={filters.source} onChange={(e) => setFilters((prev) => ({ ...prev, source: e.target.value }))}>
          <option value="">All Sources</option>
          <option value="manual">Manual</option>
          <option value="auto">Auto</option>
          <option value="system">System</option>
        </select>
        <input className="input-field" type="date" value={filters.dateFrom} onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))} />
        <input className="input-field" type="date" value={filters.dateTo} onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))} />
        <button className="btn-secondary" onClick={() => fetchLogs(1)}><FiFilter size={14} /> Filter</button>
        <button
          className="btn-secondary"
          onClick={() => {
            setFilters({ action: "", module: "", source: "", dateFrom: "", dateTo: "" });
            setTimeout(() => fetchLogs(1), 0);
          }}
        >
          <FiRefreshCw size={14} /> Reset
        </button>
      </div>

      <PermissionGuard permissions={["export_reports"]}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={exportCsv}><FiDownload size={14} /> Export CSV</button>
          <button className="btn-secondary" onClick={exportPdf}><FiDownload size={14} /> Export PDF</button>
        </div>
      </PermissionGuard>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Roles</th>
                <th>Source</th>
                <th>Action</th>
                <th>Module</th>
                <th>IP Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: "24px", textAlign: "center" }}>Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: "24px", textAlign: "center" }}>No logs found</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.user?.email || log.username || "System"}</td>
                    <td>{(log.roles || []).join(", ") || "-"}</td>
                    <td>{sourceBadge(log.source)}</td>
                    <td>{log.action}</td>
                    <td>{log.module}</td>
                    <td>{log.ipAddress}</td>
                    <td><span className={log.status === "success" ? "badge-approved" : "badge-rejected"}>{log.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Total logs: {pagination.total}</span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-secondary" disabled={page <= 1} onClick={() => fetchLogs(page - 1)}>Previous</button>
          <button className="btn-secondary" disabled={page >= pagination.pages} onClick={() => fetchLogs(page + 1)}>Next</button>
        </div>
      </div>
    </Layout>
  );
}

export default AuditLogs;
