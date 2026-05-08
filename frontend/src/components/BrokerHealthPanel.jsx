import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function BrokerHealthPanel() {
  const [brokers, setBrokers] = useState([]);

  async function loadBrokerHealth() {
    try {
      const res = await fetch(`${API_URL}/broker-health`);
      const data = await res.json();

      if (data.ok) {
        setBrokers(data.brokers || []);
      }
    } catch (error) {
      console.error("Broker health load failed:", error);
    }
  }

  useEffect(() => {
    loadBrokerHealth();

    const interval = setInterval(loadBrokerHealth, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 bg-slate-900 rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-4">
        Broker Health Monitor
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {brokers.map((broker) => (
          <div
            key={broker.broker}
            className="bg-slate-800 rounded-xl p-5 border border-slate-700"
          >
            <div className="text-sm text-slate-400">Broker</div>
            <div className="text-2xl font-bold text-white">
              {broker.broker}
            </div>

            <div className="mt-4 text-sm text-slate-300">
              Health:
              <span className="ml-2 font-bold text-green-400">
                {broker.brokerHealth}
              </span>
            </div>

            <div className="text-sm text-slate-300">
              Latency:
              <span className="ml-2 font-bold text-cyan-400">
                {broker.brokerLatencyMs} ms
              </span>
            </div>

            <div className="text-sm text-slate-300">
              Uptime:
              <span className="ml-2 font-bold text-purple-400">
                {broker.uptimeScore}%
              </span>
            </div>

            <div className="text-sm text-slate-300">
              Timeout Risk:
              <span className="ml-2 font-bold text-yellow-400">
                {broker.timeoutRisk}
              </span>
            </div>

            <div className="text-xs text-slate-500 mt-3">
              Last heartbeat:{" "}
              {new Date(broker.lastHeartbeat).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}