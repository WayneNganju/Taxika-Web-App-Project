import React, { useEffect, useState } from "react";
import axios from "axios";
import { logout } from "../utils/auth"; // 🔐 custom logout utility

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    taxpayers: 0,
    agents: 0,
    admins: 0,
  });

  // Fetch users on load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/users/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      const users = res.data;
      const count = {
        total: users.length,
        taxpayers: users.filter((u) => u.role === "taxpayer").length,
        agents: users.filter((u) => u.role === "agent").length,
        admins: users.filter((u) => u.role === "admin").length,
      };

      setUsers(users);
      setCounts(count);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  // Handle Delete
  const handleDelete = async (userId) => {
    const confirmed = window.confirm("⚠️ Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:8000/api/users/${userId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      });

      // Update list after deletion
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      alert("Failed to delete user.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white font-sans">
      {/* 🧭 Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-indigo-900 shadow">
        <h1 className="text-2xl font-bold">🛠️ Admin Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-sm font-semibold"
        >
          🔓 Logout
        </button>
      </header>

      {/* 📊 Stats Section */}
      <section className="py-10 px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Total Users" value={counts.total} icon="👥" />
          <StatCard label="Taxpayers" value={counts.taxpayers} icon="🧍" />
          <StatCard label="Agents" value={counts.agents} icon="🧑‍💼" />
          <StatCard label="Admins" value={counts.admins} icon="🛡️" />
        </div>
      </section>

      {/* 📋 User Table */}
      <section className="px-6 pb-12">
        <div className="bg-white rounded-lg shadow p-6 text-gray-800">
          <h2 className="text-xl font-semibold mb-4">📋 Registered Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-indigo-100 text-indigo-800">
                  <th className="p-2 border">👤 Username</th>
                  <th className="p-2 border">📧 Email</th>
                  <th className="p-2 border">🎭 Role</th>
                  <th className="p-2 border text-center">🗑️ Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-indigo-50">
                    <td className="p-2 border">{user.username}</td>
                    <td className="p-2 border">{user.email}</td>
                    <td className="p-2 border capitalize">{user.role}</td>
                    <td className="p-2 border text-center">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                      >
                        ❌ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <p className="text-center py-4 text-gray-500">No users found.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// 🧾 Card Component
function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white text-gray-900 p-4 rounded shadow text-center border">
      <div className="text-3xl mb-1">{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
    </div>
  );
}
