import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    role: "taxpayer", // Default to taxpayer
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.password2) {
      return setError("❌ Passwords do not match.");
    }

    try {
      await axios.post("http://localhost:8000/api/register/", form);
      setSuccess("✅ Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("❌ Registration failed. Please check your input.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-center text-indigo-800 mb-6">
          📝 Create Your Taxika Account
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4 text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">👤 Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring focus:ring-indigo-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">📧 Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring focus:ring-indigo-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">🔒 Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring focus:ring-indigo-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">🔒 Confirm Password</label>
            <input
              type="password"
              name="password2"
              value={form.password2}
              onChange={handleChange}
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring focus:ring-indigo-300"
              required
            />
          </div>

          {/* Only taxpayer role is available here */}
          <input type="hidden" name="role" value="taxpayer" />

          <button
            type="submit"
            className="w-full bg-indigo-700 hover:bg-indigo-800 text-white py-2 rounded-md font-semibold transition"
          >
            🚀 Register
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          🔐 Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-700 hover:underline font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
