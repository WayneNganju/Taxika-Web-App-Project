import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ Correct import

export default function RoleBasedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("access");

  if (!token) return <Navigate to="/login" />;

  try {
    const { role } = jwtDecode(token); // ✅ Correct usage
    return allowedRoles.includes(role) ? children : <Navigate to="/unauthorized" />;
  } catch (err) {
    return <Navigate to="/login" />;
  }
}
