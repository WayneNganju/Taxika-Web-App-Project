import React, { useState } from "react";
import api from "../api";
import { logout } from "../utils/auth";

export default function TaxpayerDashboard() {
  const [taxData, setTaxData] = useState(null);
  const [file, setFile] = useState(null);

  const token = localStorage.getItem("access");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload-p9/", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTaxData(res.data.tax_record);
      alert("✅ P9 uploaded and PAYE calculated!");
    } catch (err) {
      alert("❌ Upload failed. Check your CSV format.");
    }
  };

  const handleGenerateZip = async () => {
    try {
      const res = await api.get("/generate-zip/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.open(res.data.download_url, "_blank");
    } catch (err) {
      alert("❌ ZIP generation failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white font-sans">
      {/* 🧭 Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-indigo-900 shadow">
        <h1 className="text-2xl font-bold">🎯 Taxpayer Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-sm font-semibold"
        >
          🔓 Logout
        </button>
      </header>

      {/* 📤 P9 Upload Section */}
      <section className="px-6 py-10 max-w-3xl mx-auto space-y-6">
        <div className="bg-white text-gray-900 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">📤 Upload P9 Form</h2>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block mt-2 mb-4"
          />
          <button
            onClick={handleUpload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Upload & Compute PAYE
          </button>
        </div>

        {taxData && (
          <div className="bg-white text-gray-900 rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">📊 Tax Summary</h2>
            <p>💰 Gross Income: <strong>KES {taxData.gross_income}</strong></p>
            <p>🧾 Taxable Income: <strong>KES {taxData.taxable_income}</strong></p>
            <p>💸 Computed PAYE: <strong>KES {taxData.computed_paye}</strong></p>
          </div>
        )}

        <div className="bg-white text-gray-900 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-2">📦 Generate KRA ZIP</h2>
          <button
            onClick={handleGenerateZip}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Download ZIP
          </button>
        </div>
      </section>

      {/* Footer / Help */}
      <footer className="text-center text-indigo-100 text-sm pb-6">
        🇰🇪 Need help? Your data stays secure. This is a free tool for Kenyan taxpayers.
      </footer>
    </div>
  );
}
