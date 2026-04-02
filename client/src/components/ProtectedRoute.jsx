import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowRoles = [] }) {
  const token = localStorage.getItem("token");
  const currentRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowRoles.length > 0 && !allowRoles.includes(currentRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
