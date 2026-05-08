import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function ChildOrderExecutionPanel() {
  const [symbol, setSymbol] = useState("SCOM");
  const [quantity, setQuantity] = useState(2000);
  const [executions, setExecutions] = useState([]);

  async function loadExecutions() {
    const res = await fetch(`${API_URL}/child-orders`);
    const data = await res.json();

    if (data.ok) {
      setExecutions(data.parentExecutions || []);
    }
  }

  async function executeSplitOrder() {
    await fetch(`${API_URL}/child-orders/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        symbol,
        quantity: Number(quantity),
        side: "BUY"
      })
    });

    loadExecutions();
  }

  useEffect(() => {
    loadExecutions();

    const interval = setInterval(loadExecutions, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-5">
        Child Order Execution Engine
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="bg-slate-800 rounded-xl p-3"
        >
          <option value="SCOM">SCOM</option>
          <option value="EQTY">EQTY</option>
          <option value="KCB">KCB</option>
          <option value="COOP">COOP</option>
        </select>

        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="bg-slate-800 rounded-xl p-3"
        />

        <button
          onClick={executeSplitOrder}
          className="bg-purple-600 hover:bg-purple-500 rounded-xl p-3 font-bold"
        >
          Execute Split Order
        </button>
      </div>

      <div className="space-y-5">
        {executions.map((parent) => (
          <div
            key={parent.parentId}
            className="bg-slate-800 rounded-xl p-5"
          >
            <div className="flex justify-between mb-3">
              <div>
                <div className="font-bold text-lg">
                  {parent.symbol} {parent.side}
                </div>

                <div className="text-xs text-slate-400">
                  {parent.parentId}
                </div>
              </div>

              <div className="text-cyan-400 font-bold">
                {parent.completionPercent}%
              </div>
            </div>

            <div className="h-2 bg-slate-700 rounded-full mb-4">
              <div
                className="h-2 bg-cyan-400 rounded-full"
                style={{ width: `${parent.completionPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
              <div>Qty: {parent.quantity}</div>
              <div>Style: {parent.executionStyle}</div>
              <div>Broker: {parent.recommendedBroker}</div>
              <div>Status: {parent.status}</div>
            </div>

            <table className="w-full text-sm">
              <thead className="text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="text-left py-2">Child ID</th>
                  <th className="text-left py-2">Order ID</th>
                  <th className="text-left py-2">Qty</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>

              <tbody>
                {parent.childExecutions.map((child) => (
                  <tr
                    key={child.childId}
                    className="border-b border-slate-700"
                  >
                    <td className="py-2">{child.childId}</td>
                    <td className="text-xs text-slate-300">{child.orderId}</td>
                    <td>{child.quantity}</td>
                    <td>{child.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {executions.length === 0 && (
          <div className="text-slate-400">
            No parent executions yet.
          </div>
        )}
      </div>
    </div>
  );
}