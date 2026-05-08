import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

function severityColor(severity) {
  if (severity === "HIGH") return "text-red-400 border-red-500";
  if (severity === "MEDIUM") return "text-yellow-400 border-yellow-500";
  return "text-green-400 border-green-500";
}

export default function ComplianceSurveillancePanel() {
  const [compliance, setCompliance] = useState(null);

  async function loadCompliance() {
    const res = await fetch(`${API_URL}/compliance`);
    const data = await res.json();

    if (data.ok) {
      setCompliance(data.compliance);
    }
  }

  useEffect(() => {
    loadCompliance();

    const interval = setInterval(loadCompliance, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!compliance) return null;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-5">
        Compliance Surveillance
      </h2>

      <div className="bg-slate-800 rounded-xl p-4 mb-5">
        <div className="text-sm text-slate-400">
          Total Alerts
        </div>

        <div className="text-3xl font-bold text-cyan-400">
          {compliance.totalAlerts}
        </div>
      </div>

      <div className="space-y-3">
        {compliance.alerts.map((alert, index) => (
          <div
            key={`${alert.type}-${index}`}
            className={`border-l-4 bg-slate-800 rounded-xl p-4 ${severityColor(
              alert.severity
            )}`}
          >
            <div className="flex justify-between">
              <div className="font-bold">
                {alert.type}
              </div>

              <div className="text-xs">
                {alert.severity}
              </div>
            </div>

            <div className="text-sm text-slate-300 mt-1">
              {alert.message}
            </div>

            {alert.symbol && (
              <div className="text-xs text-slate-400 mt-1">
                Symbol: {alert.symbol}
              </div>
            )}

            {alert.orderId && (
              <div className="text-xs text-slate-400">
                Order: {alert.orderId}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}