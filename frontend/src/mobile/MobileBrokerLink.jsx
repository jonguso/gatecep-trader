// src/mobile/MobileBrokerLink.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileBrokerLink() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    broker: "AIB-AXYS",
    clientNumber: "",
    cdsNumber: "",
    email: ""
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveBrokerLink() {
    try {
      setSaving(true);
      setMessage("");

      const res = await fetch(`${API_URL}/broker-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          status: "LINKED_PENDING_UPLOAD"
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to link broker");
      }

      localStorage.setItem("gatecepBrokerLink", JSON.stringify(data));

      navigate("/mobile/broker-upload");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-24">
      <h1 className="text-2xl font-bold">
        Link Your Broker
      </h1>

      <p className="text-sm text-slate-400 mt-2">
        Enter your broker details so Coach G can connect your uploaded reports
        to your investment profile.
      </p>

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div>
          <label className="text-sm text-slate-400">
            Broker
          </label>

          <select
            value={form.broker}
            onChange={(e) =>
              setForm({ ...form, broker: e.target.value })
            }
            className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-xl p-4"
          >
            <option value="AIB-AXYS">AIB-AXYS</option>
            <option value="ABC">ABC</option>
            <option value="Dyer & Blair">Dyer & Blair</option>
            <option value="NCBA Investment Bank">NCBA Investment Bank</option>
            <option value="Standard Investment Bank">Standard Investment Bank</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-400">
            Client / Account Number
          </label>

          <input
            value={form.clientNumber}
            onChange={(e) =>
              setForm({ ...form, clientNumber: e.target.value })
            }
            placeholder="Example: 123456"
            className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-xl p-4"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400">
            CDS Number
          </label>

          <input
            value={form.cdsNumber}
            onChange={(e) =>
              setForm({ ...form, cdsNumber: e.target.value })
            }
            placeholder="Example: CDSC123456"
            className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-xl p-4"
          />
        </div>

        <div>
          <label className="text-sm text-slate-400">
            Email / Username
          </label>

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            placeholder="your@email.com"
            className="mt-2 w-full bg-slate-950 border border-slate-700 rounded-xl p-4"
          />
        </div>

        {message && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 text-sm">
            {message}
          </div>
        )}

        <button
          onClick={saveBrokerLink}
          disabled={
            saving ||
            !form.broker ||
            !form.clientNumber ||
            !form.cdsNumber ||
            !form.email
          }
          className="w-full bg-cyan-600 rounded-2xl p-4 font-bold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Link Broker and Continue"}
        </button>
      </div>
    </div>
  );
}