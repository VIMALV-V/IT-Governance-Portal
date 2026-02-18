import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/dashboard/stats");
        setStats(res.data);
      } catch (error) {
        setStats("forbidden");
      }
    };

    fetchStats();
  }, []);

  if (stats === "forbidden") {
    return (
      <Layout>
        <p>You are not authorized to view dashboard stats.</p>
      </Layout>
    );
  }

  if (!stats)
    return (
      <Layout>
        <p>Loading dashboard...</p>
      </Layout>
    );

  const requestChartData = {
  labels: ["Total Requests", "Pending Requests"],
  datasets: [
    {
      label: "Requests",
      data: [stats.totalRequests, stats.pendingRequests],
      backgroundColor: ["#3B82F6", "#F59E0B"],
      borderRadius: 8,
    },
  ],
};


  const complianceChartData = {
  labels: ["Compliant", "Non-Compliant"],
  datasets: [
    {
      data: [
        parseFloat(stats.compliancePercentage),
        100 - parseFloat(stats.compliancePercentage),
      ],
      backgroundColor: ["#10B981", "#EF4444"],
      borderWidth: 0,
    },
  ],
};


  return (
    <Layout>
      <div className="mb-10">
  <h1 className="text-4xl font-bold text-gray-800">
    Governance Dashboard
  </h1>
  <p className="text-gray-500 mt-2">
    Overview of policies, compliance and operational governance metrics.
  </p>
</div>



      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300
">

  {/* Policies */}
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
    <div className="h-1 bg-blue-500 rounded-t-xl mb-4"></div>
    <h2 className="text-sm text-gray-500">Total Policies</h2>
    <p className="text-4xl font-bold text-blue-600 mt-2">
      {stats.totalPolicies}
    </p>
  </div>

  {/* Requests */}
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
    <div className="h-1 bg-green-500 rounded-t-xl mb-4"></div>
    <h2 className="text-sm text-gray-500">Total Requests</h2>
    <p className="text-4xl font-bold text-green-600 mt-2">
      {stats.totalRequests}
    </p>
  </div>

  {/* Pending */}
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
    <div className="h-1 bg-yellow-500 rounded-t-xl mb-4"></div>
    <h2 className="text-sm text-gray-500">Pending Requests</h2>
    <p className="text-4xl font-bold text-yellow-600 mt-2">
      {stats.pendingRequests}
    </p>
  </div>

  {/* Compliance */}
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition">
    <div className="h-1 bg-purple-500 rounded-t-xl mb-4"></div>
    <h2 className="text-sm text-gray-500">Compliance</h2>
    <p className="text-4xl font-bold text-purple-600 mt-2">
      {stats.compliancePercentage}
    </p>
  </div>

</div>


      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

  <div className="bg-white p-6 rounded-xl shadow-md">
    <h2 className="text-lg font-semibold mb-4">
      Requests Overview
    </h2>
    <Bar data={requestChartData} />
  </div>

  <div className="bg-white p-6 rounded-xl shadow-md">
    <h2 className="text-lg font-semibold mb-4">
      Compliance Overview
    </h2>
    <Pie data={complianceChartData} />
  </div>

</div>

    </Layout>
  );
}

export default Dashboard;
