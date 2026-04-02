import React, { useMemo, useState } from "react";
import Layout from "../components/Layout";
import { FiCheckSquare, FiShield, FiTarget } from "react-icons/fi";

const controls = [
  { id: "AC-1", domain: "Access", name: "Privileged Access Review", owner: "IAM Team", maturity: "Managed", status: "Active", cadence: "Monthly" },
  { id: "CM-2", domain: "Change", name: "Emergency Change Approval", owner: "Change Board", maturity: "Defined", status: "Active", cadence: "Per change" },
  { id: "IR-4", domain: "Incident", name: "Incident Severity Triage", owner: "SOC", maturity: "Optimized", status: "Active", cadence: "Real-time" },
  { id: "BK-3", domain: "Resilience", name: "Backup Restore Testing", owner: "Infrastructure", maturity: "Defined", status: "Active", cadence: "Quarterly" },
  { id: "VM-8", domain: "Vulnerability", name: "Critical Patch SLA", owner: "Security Ops", maturity: "Managed", status: "Active", cadence: "Weekly" },
  { id: "DP-5", domain: "Data", name: "Data Retention Validation", owner: "Compliance", maturity: "Initial", status: "Draft", cadence: "Monthly" },
];

const scoreMap = {
  Initial: 1,
  Defined: 2,
  Managed: 3,
  Optimized: 4,
};

function Controls() {
  const [domain, setDomain] = useState("All");

  const domains = useMemo(() => ["All", ...new Set(controls.map((item) => item.domain))], []);
  const visible = useMemo(() => {
    return domain === "All" ? controls : controls.filter((item) => item.domain === domain);
  }, [domain]);

  const maturityAvg = useMemo(() => {
    if (!visible.length) return 0;
    const total = visible.reduce((sum, item) => sum + (scoreMap[item.maturity] || 0), 0);
    return (total / visible.length).toFixed(1);
  }, [visible]);

  return (
    <Layout>
      <div className="page-header">
        <h1>Controls Library</h1>
        <p>Track preventive and detective controls with ownership, cadence, and maturity.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <FiCheckSquare style={{ color: "var(--accent)" }} />
            <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Total Controls</span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700 }}>{controls.length}</div>
        </div>
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <FiShield style={{ color: "var(--success)" }} />
            <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Active Controls</span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700 }}>{controls.filter((item) => item.status === "Active").length}</div>
        </div>
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <FiTarget style={{ color: "var(--warning)" }} />
            <span style={{ color: "var(--text-secondary)", fontSize: "13px" }}>Avg Maturity</span>
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700 }}>{maturityAvg}/4</div>
        </div>
      </div>

      <div className="card" style={{ padding: "18px", marginBottom: "16px" }}>
        <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginRight: "10px" }}>Filter domain</label>
        <select className="input-field" style={{ maxWidth: "260px" }} value={domain} onChange={(e) => setDomain(e.target.value)}>
          {domains.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="card" style={{ padding: "20px", overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Control ID</th>
              <th>Domain</th>
              <th>Control</th>
              <th>Owner</th>
              <th>Maturity</th>
              <th>Cadence</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item.id}>
                <td style={{ fontFamily: "'DM Mono', monospace" }}>{item.id}</td>
                <td>{item.domain}</td>
                <td>{item.name}</td>
                <td>{item.owner}</td>
                <td>{item.maturity}</td>
                <td>{item.cadence}</td>
                <td><span className={item.status === "Active" ? "badge-approved" : "badge-pending"}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Controls;
