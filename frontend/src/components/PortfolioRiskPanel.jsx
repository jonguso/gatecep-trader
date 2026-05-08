import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

function RiskBadge({ score }) {
  let color = "text-green-400";

  if (score >= 70) {
    color = "text-red-400";
  } else if (score >= 40) {
    color = "text-yellow-400";
  }

  return (
    <span className={`font-bold ${color}`}>
      {score}
    </span>
  );
}

export default function PortfolioRiskPanel() {
  const [risk, setRisk] = useState(null);

  async function loadRisk() {
    try {
      const res = await fetch(`${API_URL}/risk`);
      const data = await res.json();

      if (data.ok) {
        setRisk(data.risk);
      }
    } catch (error) {
      console.error("Risk load failed:", error);
    }
  }

  useEffect(() => {
    loadRisk();

    const interval = setInterval(loadRisk, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!risk) {
    return null;
  }

  return (
    <div className="mt-6 bg-slate-900 rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-5">
        Portfolio Risk Engine
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="bg-slate-800 rounded-xl p-5">
          <div className="text-sm text-slate-400 mb-2">
            Total Exposure
          </div>

          <div className="text-3xl font-bold text-cyan-400">
            KES {risk.totalExposure}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-5">
          <div className="text-sm text-slate-400 mb-2">
            Concentration Risk
          </div>

          <div
            className={`text-3xl font-bold ${
              risk.concentrationRisk
                ? "text-red-400"
                : "text-green-400"
            }`}
          >
            {risk.concentrationRisk ? "HIGH" : "NORMAL"}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="text-left py-2">Symbol</th>
              <th className="text-left py-2">Qty</th>
              <th className="text-left py-2">Avg Price</th>
              <th className="text-left py-2">Market Value</th>
              <th className="text-left py-2">Exposure %</th>
              <th className="text-left py-2">Realized P&L</th>
              <th className="text-left py-2">Unrealized P&L</th>
              <th className="text-left py-2">Risk Score</th>
            </tr>
          </thead>

          <tbody>
            {risk.positions.map((position) => (
              <tr
                key={position.symbol}
                className="border-b border-slate-800"
              >
                <td className="py-3 font-bold">
                  {position.symbol}
                </td>

                <td>{position.quantity}</td>

                <td>
                  KES {position.averagePrice}
                </td>

                <td>
                  KES {position.marketValue}
                </td>

                <td>
                  {position.exposurePercent}%
                </td>

                <td className="text-green-400">
                  KES {position.realizedPnL}
                </td>

                <td
                  className={
                    position.unrealizedPnL >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  KES {position.unrealizedPnL}
                </td>

                <td>
                  <RiskBadge
                    score={position.riskScore}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {risk.concentrationRisk && (
        <div className="mt-5 bg-red-950 border border-red-500 rounded-xl p-4">
          <div className="text-red-400 font-bold mb-1">
            Risk Alert
          </div>

          <div className="text-slate-200 text-sm">
            Portfolio concentration exceeds institutional
            diversification threshold.
          </div>
        </div>
      )}
    </div>
  );
}