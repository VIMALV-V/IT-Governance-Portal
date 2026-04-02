import React, { useState, useMemo } from "react";
import { FiSearch, FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown } from "react-icons/fi";

function StatusBadge({ status }) {
  const map = {
    Approved: "badge-approved",
    Pending: "badge-pending",
    Rejected: "badge-rejected",
    Active: "badge-active",
    Inactive: "badge-rejected",
    Low: "badge-low",
    Medium: "badge-medium",
    High: "badge-high",
    Critical: "badge-critical",
    Open: "badge-pending",
    "In Progress": "badge-active",
    Resolved: "badge-approved",
  };
  const cls = map[status] || "badge-pending";
  return (
    <span className={cls}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
      {status}
    </span>
  );
}

function DataTable({
  columns,
  data,
  searchKeys,
  emptyMessage = "No data found.",
  pageSize = 8,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      (searchKeys || columns.map((c) => c.key)).some((key) =>
        String(row[key] ?? "").toLowerCase().includes(q)
      )
    );
  }, [data, search, searchKeys, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? "").toLowerCase();
      const bv = String(b[sortKey] ?? "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div>
      <div style={{ marginBottom: "16px", position: "relative", maxWidth: "320px" }}>
        <FiSearch
          size={14}
          style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            color: "var(--text-muted)", pointerEvents: "none",
          }}
        />
        <input
          className="input-field"
          style={{ paddingLeft: "34px", fontSize: "13px" }}
          placeholder="Search..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid var(--border)" }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{ cursor: col.sortable !== false ? "pointer" : "default", userSelect: "none", whiteSpace: "nowrap" }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    {col.label}
                    {col.sortable !== false && (
                      <span style={{ color: sortKey === col.key ? "var(--accent)" : "var(--text-muted)", display: "inline-flex", flexDirection: "column" }}>
                        {sortKey === col.key && sortDir === "asc" ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "48px 16px", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>No Records</div>
                  <div style={{ fontSize: "14px" }}>{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr key={row._id || row.id || i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.key === "status" || col.key === "severity"
                        ? <StatusBadge status={row[col.key]} />
                        : col.render
                          ? col.render(row)
                          : <span style={{ color: "var(--text-primary)", fontSize: "14px" }}>{row[col.key] ?? "-"}</span>
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "16px", fontSize: "13px", color: "var(--text-secondary)",
          flexWrap: "wrap", gap: "8px",
        }}>
          <span>
            Showing {Math.min((page - 1) * pageSize + 1, sorted.length)}-{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: "13px" }}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <FiChevronLeft size={14} /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} style={{ padding: "6px 4px", color: "var(--text-muted)" }}>...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: "6px 12px", fontSize: "13px", borderRadius: "8px",
                      border: "1.5px solid",
                      borderColor: page === p ? "var(--accent)" : "var(--border)",
                      background: page === p ? "var(--accent)" : "var(--bg-tertiary)",
                      color: page === p ? "white" : "var(--text-primary)",
                      cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: "13px" }}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { StatusBadge };
export default DataTable;
