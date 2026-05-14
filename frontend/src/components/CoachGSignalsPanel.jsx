import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function signalColor(recommendation = "") {
  if (recommendation.includes("BUY")) {
    return "text-green-400 border-green-500";
  }

  if (recommendation.includes("SELL")) {
    return "text-red-400 border-red-500";
  }

  return "text-yellow-400 border-yellow-500";
}

function severityStyle(severity = "") {
  if (severity === "HIGH") {
    return "bg-red-500/20 border-red-500 text-red-300";
  }

  if (severity === "MEDIUM") {
    return "bg-yellow-500/20 border-yellow-500 text-yellow-300";
  }

  return "bg-cyan-500/20 border-cyan-500 text-cyan-300";
}

export default function CoachGSignalsPanel() {
  const [signals, setSignals] = useState([]);
  const [coachAlerts, setCoachAlerts] = useState([]);

  async function loadSignals() {
    try {
      const res = await fetch(`${API_URL}/ai/signals`);
      const data = await res.json();

      if (data.ok) {
        setSignals(data.signals || []);
      }
    } catch (error) {
      console.error("Failed to load Coach G signals:", error);
    }
  }

  useEffect(() => {
    loadSignals();

    const interval = setInterval(() => {
      loadSignals();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token =
      localStorage.getItem("gatecep_token");

    const socket = io(API_URL, {
      transports: ["websocket"],
      auth: {
        token
      }
    });

    socket.on("connect", () => {
      console.log("Connected to Coach G socket");
    });

    socket.on("connect_error", (error) => {
      console.error(
        "Coach G socket error:",
        error.message
      );
    });

    socket.on("coachg:alerts", (alerts) => {
      console.log("LIVE ALERTS", alerts);

      setCoachAlerts(alerts || []);
    });

    return () => {
      socket.off("coachg:alerts");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            Coach G AI Trading Signals
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Live AI-powered NSE market intelligence
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500 text-cyan-300 text-sm">
          LIVE AI ENGINE
        </div>
      </div>

      {coachAlerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            Coach G Live Alerts
          </h3>

          <div className="space-y-3">
            {coachAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl border px-4 py-3 ${severityStyle(
                  alert.severity
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold">
                    {alert.severity} ALERT
                  </div>

                  <div className="text-xs opacity-70">
                    {new Date(
                      alert.createdAt
                    ).toLocaleTimeString()}
                  </div>
                </div>

                <div className="mt-1 text-sm">
                  {alert.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {signals.map((signal) => (
          <div
            key={signal.symbol}
            className={`bg-slate-800 rounded-2xl p-5 border ${signalColor(
              signal.recommendation
            )}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase text-slate-400">
                  NSE Symbol
                </div>

                <div className="text-3xl font-bold text-white">
                  {signal.symbol}
                </div>
              </div>

              <div className="text-xs px-3 py-1 rounded-full bg-slate-700">
                AI
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-slate-400 mb-1">
                Recommendation
              </div>

              <div className="text-xl font-bold">
                {signal.recommendation}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">
                  Confidence
                </span>

                <span className="font-bold text-cyan-400">
                  {signal.confidence}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Momentum
                </span>

                <span className="font-bold">
                  {signal.momentum}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  MA Trend
                </span>

                <span className="font-bold">
                  {signal.movingAverageTrend}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Volatility
                </span>

                <span className="font-bold">
                  {signal.volatility}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-700">
              <div className="text-xs text-slate-500">
                Generated
              </div>

              <div className="text-xs text-slate-300 mt-1">
                {new Date(
                  signal.generatedAt
                ).toLocaleString()}
              </div>
            </div>
          </div>
        ))}

        {signals.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-400">
            No Coach G signals available.
          </div>
        )}
      </div>
    </div>
  );
}
