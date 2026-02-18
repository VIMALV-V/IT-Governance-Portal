import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";

function Requests({ setPage }) {
  const [requests, setRequests] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const role = localStorage.getItem("role");

  const fetchRequests = async () => {
    try {
      const res = await API.get("/requests");
      setRequests(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const submitRequest = async (e) => {
    e.preventDefault();

    try {
      await API.post("/requests", { title, description });
      setTitle("");
      setDescription("");
      fetchRequests();
    } catch (error) {
      alert("Request submission failed");
    }
  };

  const reviewRequest = async (id, status) => {
    try {
      await API.put(`/requests/${id}`, { status });
      fetchRequests();
    } catch (error) {
      alert("Action failed");
    }
  };

  return (
    <Layout >
      <h1 className="text-3xl font-bold mb-6">Requests</h1>

      {/* Employee Request Submission */}
      {role === "Employee" && (
        <form className="bg-white p-6 rounded shadow mb-6" onSubmit={submitRequest}>
          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Request Title"
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
            Submit Request
          </button>
        </form>
      )}

      {/* Request List */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Request List</h2>

        {requests.map((req) => (
          <div key={req._id} className="border-b py-3">
            <div className="flex justify-between">
              <span className="font-medium">{req.title}</span>
              <span className="text-gray-500">{req.status}</span>
            </div>

            {(role === "Admin" || role === "Manager") && (
              <div className="mt-2 flex gap-2">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => reviewRequest(req._id, "Approved")}
                >
                  Approve
                </button>

                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => reviewRequest(req._id, "Rejected")}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Requests;
