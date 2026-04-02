import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Policies = lazy(() => import("./pages/Policies"));
const Requests = lazy(() => import("./pages/Requests"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Risks = lazy(() => import("./pages/Risks"));
const Controls = lazy(() => import("./pages/Controls"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));
import ProtectedRoute from "./components/ProtectedRoute";
import PermissionGuard from "./components/PermissionGuard";

function RouteFallback() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--text-secondary)" }}>
      Loading...
    </div>
  );
}

function App() {
  const token = localStorage.getItem("token");

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />
        <Route path="/controls" element={<ProtectedRoute><Controls /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/risks" element={<ProtectedRoute><Risks /></ProtectedRoute>} />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute allowRoles={["Admin", "Manager", "Auditor"]}>
              <PermissionGuard permissions={["view_audit_logs"]} fallback={<Navigate to="/dashboard" replace />}>
                <AuditLogs />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowRoles={["Admin"]}>
              <PermissionGuard permissions={["manage_users"]} fallback={<Navigate to="/dashboard" replace />}>
                <UserManagement />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedRoute allowRoles={["Admin"]}>
              <PermissionGuard permissions={["manage_roles"]} fallback={<Navigate to="/dashboard" replace />}>
                <RoleManagement />
              </PermissionGuard>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} />} />
      </Routes>
    </Suspense>
  );
}

export default App;

