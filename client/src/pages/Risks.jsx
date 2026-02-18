import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";

function Risks({ setPage }) {
  const [risks, setRisks] = useState([]);
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("Low");
  const role = localStorage.getItem("role");

  const fetchRisks = async () => {
    try {
      const res = await API.get("/risks");
      setRisks(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const createRisk = async (e) => {
    e.preventDefault();

    try {
      await API.post("/risks", {
        title,
        severity,
        status: "Open",
      });

      setTitle("");
      fetchRisks();
    } catch (error) {
      alert("Risk creation failed");
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Risk Management</h1>
      {(role === "Admin" || role ==="Manager") && (
      <form className="bg-white p-6 rounded shadow mb-6" onSubmit={createRisk}>
        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="Risk Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="w-full border p-2 mb-3 rounded"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Risk
        </button>
      </form>
      )}

      <div className="bg-white p-6 rounded shadow">
        {risks.map((risk) => (
          <div key={risk._id} className="border-b py-2">
            <strong>{risk.title}</strong> — {risk.severity} — {risk.status}
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Risks;
