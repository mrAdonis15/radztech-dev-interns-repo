import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

/**
 * ProtectedRoute - Route guard that redirects to login if not authenticated
 */
export const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  const storedToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem("authToken")
      : null;
  const effectiveToken = token || storedToken;

  if (!effectiveToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
