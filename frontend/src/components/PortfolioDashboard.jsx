import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState(null);

  async function loadPortfolio() {
    const res = await fetch(`${API_URL}/portfolio-live`);
    const data = await res.json();

    if (data.ok) {
      setPortfolio(data.portfolio);
    }
  }

  useEffect(() => {
    loadPortfolio();

    const interval = setInterval(loadPortfolio, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!portfolio) return null;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-5">
        Live Portfolio Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Cash</div>
          <div className="text-xl font-bold text-cyan-400">
            KES {portfolio.cashBalance}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Buying Power</div>
          <div className="text-xl font-bold text-purple-400">
            KES {portfolio.availableBuyingPower}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Cost Basis</div>
          <div className="text-xl font-bold">
            KES {portfolio.totalCostBasis}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Market Value</div>
          <div className="text-xl font-bold text-green-400">
            KES {portfolio.totalMarketValue}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Unrealized P&L</div>
          <div
            className={`text-xl font-bold ${
              portfolio.totalUnrealizedPnL >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            KES {portfolio.totalUnrealizedPnL} (
            {portfolio.totalUnrealizedPnLPercent}%)
          </div>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="text-slate-400 border-b border-slate-700">
          <tr>
            <th className="text-left py-2">Symbol</th>
            <th className="text-left py-2">Qty</th>
            <th className="text-left py-2">Avg Cost</th>
            <th className="text-left py-2">Market Price</th>
            <th className="text-left py-2">Market Value</th>
            <th className="text-left py-2">Unrealized P&L</th>
          </tr>
        </thead>

        <tbody>
          {portfolio.positions.map((pos) => (
            <tr key={pos.symbol} className="border-b border-slate-800">
              <td className="py-3 font-bold">{pos.symbol}</td>
              <td>{pos.quantity}</td>
              <td>KES {pos.averageCost}</td>
              <td>KES {pos.marketPrice}</td>
              <td>KES {pos.marketValue}</td>
              <td
                className={
                  pos.unrealizedPnL >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                KES {pos.unrealizedPnL} ({pos.unrealizedPnLPercent}%)
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}