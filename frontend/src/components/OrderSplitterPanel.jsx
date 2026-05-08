import React, { useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function OrderSplitterPanel() {
  const [symbol, setSymbol] = useState("SCOM");
  const [quantity, setQuantity] = useState(5000);
  const [split, setSplit] = useState(null);

  async function generateSplit() {
    const res = await fetch(
      `${API_URL}/order-splitter`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          symbol,
          quantity: Number(quantity)
        })
      }
    );

    const data = await res.json();

    if (data.ok) {
      setSplit(data.split);
    }
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-5">
        Smart Order Splitter
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
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
          placeholder="Quantity"
        />

        <button
          onClick={generateSplit}
          className="bg-cyan-600 hover:bg-cyan-500 rounded-xl p-3 font-bold"
        >
          Generate Split
        </button>
      </div>

      {split && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">
                Parent Quantity
              </div>

              <div className="text-2xl font-bold text-white">
                {split.parentQuantity}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">
                Execution Style
              </div>

              <div className="text-2xl font-bold text-cyan-400">
                {split.executionStyle}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">
                Market Impact
              </div>

              <div className="text-2xl font-bold text-yellow-400">
                {split.estimatedMarketImpact}%
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">
                Recommended Broker
              </div>

              <div className="text-2xl font-bold text-purple-400">
                {split.recommendedBroker}
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-5 mb-5">
            <div className="text-cyan-400 font-bold mb-2">
              Coach G Split Summary
            </div>

            <div className="text-sm text-slate-200">
              Coach G recommends{" "}
              <span className="font-bold">
                {split.executionStyle}
              </span>{" "}
              execution using{" "}
              <span className="font-bold">
                {split.childOrderCount}
              </span>{" "}
              child orders routed through{" "}
              <span className="font-bold">
                {split.recommendedBroker}
              </span>.
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="text-left py-2">
                    Child Order
                  </th>

                  <th className="text-left py-2">
                    Quantity
                  </th>

                  <th className="text-left py-2">
                    Execution Window
                  </th>
                </tr>
              </thead>

              <tbody>
                {split.childOrders.map((child) => (
                  <tr
                    key={child.childId}
                    className="border-b border-slate-800"
                  >
                    <td className="py-3">
                      {child.childId}
                    </td>

                    <td>{child.quantity}</td>

                    <td>
                      {child.executionWindowSeconds}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}