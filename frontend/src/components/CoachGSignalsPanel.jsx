import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

function signalColor(recommendation) {
  if (recommendation.includes("BUY")) return "text-green-400 border-green-500";
  if (recommendation.includes("SELL")) return "text-red-400 border-red-500";
  return "text-yellow-400 border-yellow-500";
}

export default function CoachGSignalsPanel() {
  const [signals, setSignals] = useState([]);

  async function loadSignals() {
    const res = await fetch(`${API_URL}/ai/signals`);
    const data = await res.json();

    if (data.ok) {
      setSignals(data.signals || []);
    }
  }

  useEffect(() => {
    loadSignals();

    const interval = setInterval(loadSignals, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-5">
        Coach G AI Trading Signals
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {signals.map((signal) => (
          <div
            key={signal.symbol}
            className={`bg-slate-800 rounded-xl p-5 border ${signalColor(
              signal.recommendation
            )}`}
          >
            <div className="text-sm text-slate-400">Symbol</div>
            <div className="text-2xl font-bold text-white mb-3">
              {signal.symbol}
            </div>

            <div className="text-sm text-slate-400">Recommendation</div>
            <div className="text-xl font-bold mb-3">
              {signal.recommendation}
            </div>

            <div className="text-sm">
              Confidence:{" "}
              <span className="font-bold text-cyan-400">
                {signal.confidence}%
              </span>
            </div>

            <div className="text-sm">
              Momentum:{" "}
              <span className="font-bold">
                {signal.momentum}
              </span>
            </div>

            <div className="text-sm">
              MA Trend:{" "}
              <span className="font-bold">
                {signal.movingAverageTrend}
              </span>
            </div>

            <div className="text-sm">
              Volatility:{" "}
              <span className="font-bold">
                {signal.volatility}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}