import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

function BrokerScoreCard({ broker, score, highlight }) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-xl border ${
        highlight
          ? "border-cyan-400 bg-slate-800"
          : "border-slate-700 bg-slate-900"
      }`}
    >
      <div className="text-sm text-slate-400 mb-2">
        Broker
      </div>

      <div className="text-2xl font-bold text-white">
        {broker}
      </div>

      <div className="mt-3">
        <div className="text-xs text-slate-400 mb-1">
          Execution Score
        </div>

        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-3 bg-cyan-400"
            style={{
              width: `${Math.min(score, 100)}%`
            }}
          />
        </div>

        <div className="text-cyan-400 font-bold mt-2">
          {score}
        </div>
      </div>
    </div>
  );
}

export default function SmartRoutingPanel() {
  const [routing, setRouting] = useState(null);

  async function loadRouting() {
    try {
      const res = await fetch(
        `${API_URL}/execution/smart-routing`
      );

      const data = await res.json();

      if (data.ok) {
        setRouting(data.recommendation);
      }
    } catch (error) {
      console.error("Routing load failed:", error);
    }
  }

  useEffect(() => {
    loadRouting();

    const interval = setInterval(loadRouting, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!routing) {
    return null;
  }

  const scores = Object.entries(
    routing.brokerScores || {}
  );

  return (
    <div className="mt-6">
      <div className="bg-slate-900 rounded-2xl p-6 shadow-xl mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          AI Smart Routing Engine
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-sm text-slate-400 mb-2">
              Recommended Broker
            </div>

            <div className="text-3xl font-bold text-cyan-400">
              {routing.recommendedBroker}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-sm text-slate-400 mb-2">
              Best Execution
            </div>

            <div className="text-3xl font-bold text-green-400">
              {routing.bestExecutionBroker}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-sm text-slate-400 mb-2">
              Weakest Broker
            </div>

            <div className="text-3xl font-bold text-red-400">
              {routing.worstExecutionBroker}
            </div>
          </div>
        </div>

        <div className="mt-5 bg-slate-800 rounded-xl p-4 border border-cyan-500">
          <div className="text-cyan-400 font-bold mb-2">
            Coach G Recommendation
          </div>

          <div className="text-slate-200">
            Route future orders through{" "}
            <span className="font-bold text-cyan-400">
              {routing.recommendedBroker}
            </span>{" "}
            for highest execution quality and reduced rejection risk.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {scores.map(([broker, score]) => (
          <BrokerScoreCard
            key={broker}
            broker={broker}
            score={score}
            highlight={
              broker === routing.recommendedBroker
            }
          />
        ))}
      </div>
    </div>
  );
}