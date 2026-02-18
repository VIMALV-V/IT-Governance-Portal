import React, { useEffect, useState } from "react";
import API from "../api/api";
import Layout from "../components/Layout";

function Notifications({ setPage }) {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <Layout >
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      <div className="bg-white p-6 rounded shadow">
        {notifications.map((n) => (
          <div key={n._id} className="border-b py-2">
            {n.message}
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Notifications;
