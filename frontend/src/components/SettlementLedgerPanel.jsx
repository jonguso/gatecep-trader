import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function SettlementLedgerPanel() {
  const [settlement, setSettlement] = useState(null);

  async function loadSettlement() {
    const res = await fetch(`${API_URL}/settlement-ledger`);
    const data = await res.json();

    if (data.ok) {
      setSettlement(data.settlement);
    }
  }

  useEffect(() => {
    loadSettlement();

    const interval = setInterval(loadSettlement, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!settlement) return null;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-5">
        Settlement Ledger
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Settled Cash</div>
          <div className="text-xl font-bold text-green-400">
            KES {settlement.settledCash}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Unsettled Cash</div>
          <div className="text-xl font-bold text-yellow-400">
            KES {settlement.unsettledCash}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-sm text-slate-400">Available Cash</div>
          <div className="text-xl font-bold text-cyan-400">
            KES {settlement.availableCash}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="text-left py-2">Order ID</th>
              <th className="text-left py-2">Symbol</th>
              <th className="text-left py-2">Side</th>
              <th className="text-left py-2">Qty</th>
              <th className="text-left py-2">Trade Value</th>
              <th className="text-left py-2">Trade Date</th>
              <th className="text-left py-2">Settlement Date</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {settlement.ledger.map((entry) => (
              <tr key={entry.orderId} className="border-b border-slate-800">
                <td className="py-3 text-xs text-slate-300">
                  {entry.orderId}
                </td>
                <td className="font-bold">{entry.symbol}</td>
                <td>{entry.side}</td>
                <td>{entry.quantity}</td>
                <td>KES {entry.tradeValue}</td>
                <td className="text-xs">
                  {new Date(entry.tradeDate).toLocaleString()}
                </td>
                <td className="text-xs">
                  {new Date(entry.settlementDate).toLocaleString()}
                </td>
                <td
                  className={
                    entry.settlementStatus === "SETTLED"
                      ? "text-green-400"
                      : "text-yellow-400"
                  }
                >
                  {entry.settlementStatus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}