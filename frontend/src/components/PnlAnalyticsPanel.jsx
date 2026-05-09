import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function PnlAnalyticsPanel() {
  const [pnl, setPnl] = useState(null);

  async function loadPnl() {
    const res = await fetch(`${API_URL}/pnl`);
    const data = await res.json();

    if (data.ok) {
      setPnl(data.pnl);
    }
  }

  useEffect(() => {
    loadPnl();

    const interval = setInterval(loadPnl, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!pnl) return null;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-5">
        Realized P&L Analytics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Total Realized P&L</div>
          <div
            className={`text-xl font-bold ${
              pnl.totalRealizedPnL >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            KES {pnl.totalRealizedPnL}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Trades</div>
          <div className="text-xl font-bold">{pnl.totalTrades}</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Winning Trades</div>
          <div className="text-xl font-bold text-green-400">
            {pnl.winningTrades}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Losing Trades</div>
          <div className="text-xl font-bold text-red-400">
            {pnl.losingTrades}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="text-left py-2">Symbol</th>
              <th className="text-left py-2">Qty</th>
              <th className="text-left py-2">Avg Cost</th>
              <th className="text-left py-2">Sell Price</th>
              <th className="text-left py-2">Broker</th>
              <th className="text-left py-2">Realized P&L</th>
              <th className="text-left py-2">Time</th>
            </tr>
          </thead>

          <tbody>
            {pnl.trades.map((trade) => (
              <tr key={trade.id} className="border-b border-slate-800">
                <td className="py-3 font-bold">{trade.symbol}</td>
                <td>{trade.quantity}</td>
                <td>KES {trade.averageCost}</td>
                <td>KES {trade.sellPrice}</td>
                <td>{trade.broker}</td>
                <td
                  className={
                    trade.realizedPnL >= 0 ? "text-green-400" : "text-red-400"
                  }
                >
                  KES {trade.realizedPnL}
                </td>
                <td className="text-xs">
                  {new Date(trade.realizedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}