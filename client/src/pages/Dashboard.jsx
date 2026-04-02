import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";
import StatCard from "../components/Card";
import {
  FiFileText, FiClipboard, FiClock, FiBarChart2,
  FiCheckCircle, FiXCircle, FiUsers, FiCheckSquare,
} from "react-icons/fi";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: "20px" }}>
      <div className="skeleton" style={{ width: "40px", height: "40px", borderRadius: "10px", marginBottom: "16px" }} />
      <div className="skeleton" style={{ width: "60%", height: "12px", marginBottom: "8px" }} />
      <div className="skeleton" style={{ width: "40%", height: "28px" }} />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="card" style={{ padding: "24px" }}>
      <div className="skeleton" style={{ width: "40%", height: "16px", marginBottom: "24px" }} />
      <div className="skeleton" style={{ width: "100%", height: "200px" }} />
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/dashboard/stats");
        setStats(res.data);
      } catch {
        setStats("forbidden");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div style={{ marginBottom: "28px" }}>
          <div className="skeleton" style={{ width: "200px", height: "24px", marginBottom: "8px" }} />
          <div className="skeleton" style={{ width: "320px", height: "14px" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <SkeletonChart /><SkeletonChart />
        </div>
      </Layout>
    );
  }

  if (stats === "forbidden") {
    return (
      <Layout>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "80px 0", gap: "12px",
        }}>
          <div style={{ fontSize: "48px" }}>Access</div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)" }}>Access Restricted</h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>You do not have permission to view dashboard stats.</p>
        </div>
      </Layout>
    );
  }

  const compliancePct = Number(stats.compliancePercentage || 0);

  const requestChartData = {
    labels: ["Total", "Pending", "Approved", "Rejected"],
    datasets: [{
      label: "Requests",
      data: [stats.totalRequests, stats.pendingRequests, stats.approvedRequests, stats.rejectedRequests],
      backgroundColor: ["#4f6ef7", "#f59e0b", "#10b981", "#ef4444"],
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const complianceChartData = {
    labels: ["Compliant", "Non-Compliant"],
    datasets: [{
      data: [compliancePct, Math.max(0, 100 - compliancePct)],
      backgroundColor: ["#10b981", "#f1f3f9"],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "var(--bg-secondary)",
        titleColor: "var(--text-primary)",
        bodyColor: "var(--text-secondary)",
        borderColor: "var(--border)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "var(--text-muted)", font: { size: 12 } } },
      y: { grid: { color: "var(--border)" }, ticks: { color: "var(--text-muted)", font: { size: 12 } } },
    },
  };

  const pieOptions = {
    responsive: true,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "var(--text-secondary)", padding: 16, font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: "var(--bg-secondary)",
        titleColor: "var(--text-primary)",
        bodyColor: "var(--text-secondary)",
        borderColor: "var(--border)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Governance Dashboard</h1>
        <p>Overview of policies, compliance, controls, and operational governance metrics.</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
      }}>
        <StatCard title="Total Policies" value={stats.totalPolicies} icon={FiFileText} color="blue" subtitle="All governance policies" />
        <StatCard title="Total Requests" value={stats.totalRequests} icon={FiClipboard} color="green" subtitle={`${stats.approvedRequests} approved`} />
        <StatCard title="Pending Requests" value={stats.pendingRequests} icon={FiClock} color="amber" subtitle="Awaiting review" />
        <StatCard title="Compliance Rate" value={`${compliancePct}%`} icon={FiBarChart2} color="cyan" subtitle={`${stats.totalAcknowledgements} acknowledgements`} />
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "16px",
        marginBottom: "28px",
      }}>
        <StatCard title="Approved" value={stats.approvedRequests ?? 0} icon={FiCheckCircle} color="green" />
        <StatCard title="Rejected" value={stats.rejectedRequests ?? 0} icon={FiXCircle} color="red" />
        <StatCard title="Employees" value={stats.totalEmployees ?? 0} icon={FiUsers} color="blue" />
        <StatCard title="Control Focus" value="ISO" icon={FiCheckSquare} color="cyan" subtitle="Mapped governance controls" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 3fr) minmax(260px, 2fr)", gap: "20px" }}>
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>
            Requests Overview
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
            Breakdown by status
          </p>
          <Bar data={requestChartData} options={chartOptions} />
        </div>

        <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px", alignSelf: "flex-start" }}>
            Compliance Overview
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px", alignSelf: "flex-start" }}>
            Policy acknowledgement rate
          </p>
          <div style={{ position: "relative", width: "200px" }}>
            <Pie data={complianceChartData} options={pieOptions} />
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -60%)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>{compliancePct}%</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
