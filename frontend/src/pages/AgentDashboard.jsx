import React, { useState, useEffect } from "react";
import api from "../api";
import LogoutButton from "../components/LogoutButton";


export default function AgentDashboard() {
  const [clients, setClients] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get("/agent/clients/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data);
    } catch (err) {
      alert("Failed to load client list.");
    }
  };

  return (
    <div>
      <h2>Welcome to the Agent Dashboard 🧑‍💼</h2>

      {clients.length === 0 ? (
        <p>No clients assigned.</p>
      ) : (
        <div>
          <h3>📋 Client List</h3>
          <ul>
            {clients.map((client, index) => (
              <li key={index}>
                <strong>{client.taxpayer_name}</strong> ({client.taxpayer_email})
                <ul>
                  {client.tax_records.length === 0 ? (
                    <li>No tax records</li>
                  ) : (
                    client.tax_records.map((record, i) => (
                      <li key={i}>
                        {record.year}: PAYE KES {record.computed_paye}
                      </li>
                    ))
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
