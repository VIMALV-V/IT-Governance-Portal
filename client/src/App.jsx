import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Policies from "./pages/Policies";
import Requests from "./pages/Requests";
import Notifications from "./pages/Notifications";
import Risks from "./pages/Risks";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/dashboard" /> : <Register />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/policies"
        element={
          <ProtectedRoute>
            <Policies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <Requests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/risks"
        element={
          <ProtectedRoute>
            <Risks />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
