import React from "react";
import axios from "axios";

export default function AdminUserForm({ onSuccess }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm = e.target.confirm.value;

    if (password !== confirm) {
      alert("❌ Passwords do not match.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8000/api/register/",
        {
          username,
          email,
          password,
          password2: confirm,
          role: "agent",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      alert("✅ Tax Agent registered successfully!");
      e.target.reset();
      if (onSuccess) onSuccess(); // Refresh user list
    } catch (err) {
      alert("❌ Failed to register agent.");
      console.error(err);
    }
  };

  return (
    <div className="bg-white text-gray-800 rounded-lg shadow p-6 mb-8 max-w-md">
      <h3 className="text-lg font-semibold mb-4">➕ Register Tax Agent</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="username"
          placeholder="Username"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="confirm"
          placeholder="Confirm Password"
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
        >
          ➕ Register Agent
        </button>
      </form>
    </div>
  );
}
