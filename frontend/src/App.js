import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import TaxpayerDashboard from "./pages/TaxpayerDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import PrivateRoute from "./components/PrivateRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 👤 Taxpayer Dashboard */}
        <Route
          path="/dashboard/taxpayer"
          element={
            <PrivateRoute>
              <RoleBasedRoute allowedRoles={["taxpayer"]}>
                <TaxpayerDashboard />
              </RoleBasedRoute>
            </PrivateRoute>
          }
        />

        {/* 🧑‍💼 Agent Dashboard */}
        <Route
          path="/dashboard/agent"
          element={
            <PrivateRoute>
              <RoleBasedRoute allowedRoles={["agent"]}>
                <AgentDashboard />
              </RoleBasedRoute>
            </PrivateRoute>
          }
        />

        {/* 🛠️ Admin Dashboard */}
        <Route
          path="/dashboard/admin"
          element={
            <PrivateRoute>
              <RoleBasedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </RoleBasedRoute>
            </PrivateRoute>
          }
        />

        {/* 🚫 Unauthorized Access */}
        <Route
          path="/unauthorized"
          element={
            <div className="flex justify-center items-center h-screen bg-white text-red-700 font-semibold">
              🚫 You are not authorized to access this page.
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
