import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function TradeBlotter() {
  const [orders, setOrders] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [status, setStatus] = useState("");
  const [broker, setBroker] = useState("");

  async function loadOrders() {
    const params = new URLSearchParams();

    if (symbol) params.append("symbol", symbol);
    if (status) params.append("status", status);
    if (broker) params.append("broker", broker);

    const res = await fetch(`${API_URL}/order-history?${params.toString()}`);
    const data = await res.json();

    if (data.ok) {
      setOrders(data.orders || []);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [symbol, status, broker]);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-4">Institutional Trade Blotter</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Search symbol"
          className="bg-slate-800 rounded-xl p-3 text-white"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-800 rounded-xl p-3 text-white"
        >
          <option value="">All Statuses</option>
          <option value="FILLED">FILLED</option>
          <option value="PARTIAL_FILL">PARTIAL_FILL</option>
          <option value="REJECTED">REJECTED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <input
          value={broker}
          onChange={(e) => setBroker(e.target.value)}
          placeholder="Broker"
          className="bg-slate-800 rounded-xl p-3 text-white"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="text-left py-2">Order ID</th>
              <th className="text-left py-2">Symbol</th>
              <th className="text-left py-2">Side</th>
              <th className="text-left py-2">Broker</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Qty</th>
              <th className="text-left py-2">Filled</th>
              <th className="text-left py-2">Avg Price</th>
              <th className="text-left py-2">Updated</th>
              <th className="text-left py-2">Events</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-800">
                <td className="py-3 text-xs text-slate-300">{order.id}</td>
                <td className="font-bold">{order.symbol}</td>
                <td>{order.side}</td>
                <td>{order.broker}</td>
                <td>{order.status}</td>
                <td>{order.quantity}</td>
                <td>{order.filledQuantity}/{order.quantity}</td>
                <td>KES {order.averageFillPrice}</td>
                <td className="text-xs">
                  {new Date(order.updatedAt).toLocaleString()}
                </td>
                <td>{order.executionEvents?.length || 0}</td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan="10" className="py-6 text-center text-slate-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}