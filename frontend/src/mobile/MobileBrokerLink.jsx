// src/mobile/MobileBrokerLink.jsx

import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileBrokerLink() {
  const navigate = useNavigate();
  const location = useLocation();

  const routeState = location.state || {};
  const source = routeState.source || "EXISTING_INVESTOR";
  const recommendedBroker = routeState.recommendedBroker || null;

  const defaultBroker = useMemo(() => {
    if (recommendedBroker?.name === "AIB") return "AIB-AXYS";
    if (recommendedBroker?.name) return recommendedBroker.name;
    return "AIB-AXYS";
  }, [recommendedBroker]);

  const [form, setForm] = useState({
    broker: defaultBroker,
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

      const res = await fetch(`${API_URL}/coach-g/broker-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          source,
          recommendedBroker,
          customerProfile: routeState.customerProfile || null,
          recommendation: routeState.recommendation || null,
          confidence: routeState.confidence || null,
          status: "LINKED_PENDING_UPLOAD"
        })
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to link broker");
      }

      localStorage.setItem(
        "gatecepBrokerLink",
        JSON.stringify(data.brokerLink)
      );

      navigate(data.nextStep || "/mobile/broker-upload");
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

      {source === "NEW_INVESTOR" && recommendedBroker && (
        <div className="mt-5 bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
          <div className="text-xs text-green-300 font-bold">
            Coach G Recommended Broker
          </div>

          <div className="text-xl font-bold mt-1">
            {recommendedBroker.name}
          </div>

          <div className="text-sm text-slate-300 mt-1">
            {recommendedBroker.bestFor}
          </div>

          <div className="text-sm text-cyan-300 font-bold mt-2">
            Score: {recommendedBroker.score}/100
          </div>

          {recommendedBroker.signupUrl && (
            <button
              onClick={() => window.open(recommendedBroker.signupUrl, "_blank")}
              className="w-full bg-green-600 rounded-2xl p-4 font-bold mt-4"
            >
              Continue to Broker Website
            </button>
          )}

          <p className="text-xs text-slate-400 mt-3">
            After opening your broker account, return here and enter your client
            number and CDS number to link it with Gatecep.
          </p>
        </div>
      )}

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
            <option value="Standard Investment Bank">
              Standard Investment Bank
            </option>
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