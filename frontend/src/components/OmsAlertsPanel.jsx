import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

function severityClass(severity) {
  if (severity === "HIGH") return "border-red-500 text-red-400";
  if (severity === "MEDIUM") return "border-yellow-500 text-yellow-400";
  if (severity === "LOW") return "border-cyan-500 text-cyan-400";
  return "border-green-500 text-green-400";
}

export default function OmsAlertsPanel() {
  const [alerts, setAlerts] = useState([]);

  async function loadAlerts() {
    try {
      const res = await fetch(`${API_URL}/oms-alerts`);
      const data = await res.json();

      if (data.ok) {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error("OMS alerts load failed:", error);
    }
  }

  useEffect(() => {
    loadAlerts();

    const interval = setInterval(loadAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 bg-slate-900 rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">
        OMS Alert Center
      </h2>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={`${alert.type}-${index}`}
            className={`border-l-4 bg-slate-800 rounded-xl p-4 ${severityClass(
              alert.severity
            )}`}
          >
            <div className="flex justify-between">
              <div className="font-bold">{alert.type}</div>
              <div className="text-xs">{alert.severity}</div>
            </div>

            <div className="text-sm text-slate-300 mt-1">
              {alert.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}