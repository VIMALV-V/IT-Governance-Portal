import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiClipboard,
  FiBell,
  FiAlertTriangle,
  FiLogOut,
} from "react-icons/fi";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const navItem = (path) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
      location.pathname === path
        ? "bg-gray-800 border-l-4 border-blue-500 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-2 tracking-wide">
          IT Governance
        </h2>

        <p className="text-sm text-gray-400 mb-6">
          Logged in as: {role}
        </p>

        <div className="flex flex-col gap-2">
          <button
            className={navItem("/dashboard")}
            onClick={() => navigate("/dashboard")}
          >
            <FiHome /> Dashboard
          </button>

          <button
            className={navItem("/policies")}
            onClick={() => navigate("/policies")}
          >
            <FiFileText /> Policies
          </button>

          <button
            className={navItem("/requests")}
            onClick={() => navigate("/requests")}
          >
            <FiClipboard /> Requests
          </button>

          <button
            className={navItem("/notifications")}
            onClick={() => navigate("/notifications")}
          >
            <FiBell /> Notifications
          </button>

          <button
            className={navItem("/risks")}
            onClick={() => navigate("/risks")}
          >
            <FiAlertTriangle /> Risks
          </button>

          <hr className="my-6 border-gray-700" />

          <button
            className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
            onClick={logout}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 p-10">
        {children}
      </div>
    </div>
  );
}

export default Layout;
