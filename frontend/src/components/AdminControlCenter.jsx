import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function AdminControlCenter() {
  const [dashboard, setDashboard] = useState(null);

  async function loadDashboard() {
    const res = await fetch(`${API_URL}/admin/dashboard`);
    const data = await res.json();

    if (data.ok) {
      setDashboard(data.dashboard);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(loadDashboard, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!dashboard) return null;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-5">
        Admin Control Center
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">System</div>
          <div className="text-xl font-bold text-green-400">
            {dashboard.systemStatus}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Orders</div>
          <div className="text-xl font-bold">
            {dashboard.executionSummary.totalOrders}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Fill Rate</div>
          <div className="text-xl font-bold text-cyan-400">
            {dashboard.executionSummary.fillRate}%
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Rejected</div>
          <div className="text-xl font-bold text-red-400">
            {dashboard.executionSummary.rejectedOrders}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Market Value</div>
          <div className="text-xl font-bold text-green-400">
            KES {dashboard.portfolioSummary.marketValue}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Buying Power</div>
          <div className="text-xl font-bold text-purple-400">
            KES {dashboard.portfolioSummary.buyingPower}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Unrealized P&L</div>
          <div
            className={`text-xl font-bold ${
              dashboard.portfolioSummary.unrealizedPnL >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            KES {dashboard.portfolioSummary.unrealizedPnL}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <h3 className="font-bold mb-3">Broker Health</h3>

        {dashboard.brokerSummary.map((broker) => (
          <div
            key={broker.broker}
            className="flex justify-between border-b border-slate-700 py-2"
          >
            <span>{broker.broker}</span>
            <span>{broker.brokerHealth}</span>
            <span>{broker.brokerLatencyMs} ms</span>
            <span>{broker.timeoutRisk}</span>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl p-4">
        <h3 className="font-bold mb-3">OMS Alerts</h3>

        {dashboard.omsAlerts.map((alert, index) => (
          <div
            key={`${alert.type}-${index}`}
            className="border-b border-slate-700 py-2"
          >
            <div className="font-bold">{alert.type}</div>
            <div className="text-sm text-slate-300">
              {alert.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}