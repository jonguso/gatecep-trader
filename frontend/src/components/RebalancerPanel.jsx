import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

function actionColor(action) {
  switch (action) {
    case "BUY":
      return "text-green-400 border-green-500";

    case "SELL":
      return "text-red-400 border-red-500";

    default:
      return "text-yellow-400 border-yellow-500";
  }
}

export default function RebalancerPanel() {
  const [plan, setPlan] = useState(null);

  async function loadPlan() {
    const res = await fetch(`${API_URL}/rebalancer`);
    const data = await res.json();

    if (data.ok) {
      setPlan(data.plan);
    }
  }

  useEffect(() => {
    loadPlan();

    const interval = setInterval(loadPlan, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!plan) return null;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-2xl font-bold">
            AI Portfolio Rebalancer
          </h2>

          <div className="text-sm text-slate-400 mt-1">
            Coach G portfolio optimization engine
          </div>
        </div>

        <div className="bg-cyan-600 rounded-xl px-4 py-2">
          Portfolio: KES {plan.portfolioValue}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plan.recommendations.map((item) => (
          <div
            key={item.symbol}
            className={`bg-slate-800 border rounded-xl p-5 ${actionColor(
              item.action
            )}`}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-2xl font-bold text-white">
                {item.symbol}
              </div>

              <div className="font-bold">
                {item.action}
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-200">
              <div>
                Current Weight:{" "}
                <span className="font-bold">
                  {item.currentWeight}%
                </span>
              </div>

              <div>
                Target Weight:{" "}
                <span className="font-bold">
                  {item.targetWeight}%
                </span>
              </div>

              <div>
                Drift:{" "}
                <span className="font-bold">
                  {item.drift}%
                </span>
              </div>

              <div>
                Market Value:{" "}
                <span className="font-bold">
                  KES {item.marketValue}
                </span>
              </div>

              <div>
                Target Value:{" "}
                <span className="font-bold">
                  KES {item.targetValue}
                </span>
              </div>

              <div>
                Value Difference:{" "}
                <span
                  className={
                    item.valueDifference >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  KES {item.valueDifference}
                </span>
              </div>

              <div>
                Confidence:{" "}
                <span className="text-cyan-400 font-bold">
                  {item.confidence}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}