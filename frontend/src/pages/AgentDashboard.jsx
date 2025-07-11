import React, { useState, useEffect } from "react";
import api from "../api";
import { logout } from "../utils/auth";

export default function AgentDashboard() {
  const [clients, setClients] = useState([]);
  const [year, setYear] = useState("");         // 🔍 year filter
  const [status, setStatus] = useState("");     // 🔍 tax status filter
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchClients();
  }, [year, status]); // 🌀 refetch on filter change

  const fetchClients = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (year) query.append("year", year);
      if (status) query.append("status", status);

      const res = await api.get(`/agent/clients/?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setClients(res.data);
    } catch (err) {
      alert("❌ Failed to load client list.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadZip = async (userId) => {
    try {
      const res = await api.post(`/agent/clients/${userId}/zip/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.open(res.data.download_url, "_blank");
    } catch (err) {
      alert("❌ ZIP generation failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 to-purple-700 text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-indigo-900 shadow">
        <h1 className="text-2xl font-bold">🧑‍💼 Agent Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-sm font-semibold"
        >
          🔓 Logout
        </button>
      </header>

      {/* Filters */}
      <div className="bg-indigo-800 px-6 py-4 flex gap-4 flex-wrap">
        <input
          type="text"
          placeholder="Filter by Year (e.g. 2024)"
          className="px-3 py-2 rounded text-black"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <select
          className="px-3 py-2 rounded text-black"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="filled">🟢 With Tax Records</option>
          <option value="empty">⚪ No Tax Records</option>
        </select>
      </div>

      {/* Client List */}
      <main className="px-6 py-8 max-w-5xl mx-auto">
        {loading ? (
          <p className="text-center text-lg text-indigo-100">⏳ Loading clients...</p>
        ) : clients.length === 0 ? (
          <p className="text-center text-lg text-indigo-100">🚫 No clients found.</p>
        ) : (
          <div className="space-y-6">
            {clients.map((client, index) => (
              <div key={index} className="bg-white text-gray-800 rounded shadow p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-bold text-lg">
                      👤 {client.taxpayer_name}
                      <span className="text-sm text-gray-500"> ({client.taxpayer_email})</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadZip(client.id)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded text-sm"
                  >
                    📦 Download ZIP
                  </button>
                </div>
                {client.tax_records.length === 0 ? (
                  <p className="text-sm text-gray-600">⚠️ No tax records available</p>
                ) : (
                  <table className="text-sm w-full mt-2 border">
                    <thead className="bg-indigo-100 text-indigo-900">
                      <tr>
                        <th className="p-2 border">📅 Year</th>
                        <th className="p-2 border">💰 Gross</th>
                        <th className="p-2 border">💵 Taxable</th>
                        <th className="p-2 border">📈 PAYE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {client.tax_records.map((record, i) => (
                        <tr key={i} className="text-center">
                          <td className="border p-1">{record.year}</td>
                          <td className="border p-1">{record.gross_income}</td>
                          <td className="border p-1">{record.taxable_income}</td>
                          <td className="border p-1">{record.computed_paye}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
