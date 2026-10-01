import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Guard({ admin = false, children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated)
    return (
      <Navigate
        to={admin ? "/admin/login" : "/login"}
        state={{ from: location }}
        replace
      />
    );
  if (admin && user?.role !== "admin") return <Navigate to="/" replace />;
  if (!admin && user?.role === "admin") return <Navigate to="/admin" replace />;
  return children;
}
