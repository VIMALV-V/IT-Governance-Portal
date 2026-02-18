import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";

function Policies({ setPage }) {
  const [policies, setPolicies] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const role = localStorage.getItem("role");

  const fetchPolicies = async () => {
    try {
      const res = await API.get("/policies");
      setPolicies(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const createPolicy = async (e) => {
    e.preventDefault();

    try {
      await API.post("/policies", {
        title,
        description,
        version: "1.0",
        status: "Active",
      });

      setTitle("");
      setDescription("");
      fetchPolicies();
    } catch (error) {
      alert("Policy creation failed");
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Policies</h1>

      {/* Create Policy Form */}
      {role === "Admin" &&
      <form
        onSubmit={createPolicy}
        className="bg-white p-6 rounded shadow mb-6 max-w-md"
      >
        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="Policy Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="w-full border p-2 mb-3 rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Policy
        </button>
      </form>
}

      {/* Policy List */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Policy List</h2>

        {policies.map((policy) => (
          <div
            key={policy._id}
            className="border-b py-2 flex justify-between"
          >
            <span>{policy.title}</span>
            <span className="text-gray-500">{policy.status}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Policies;
