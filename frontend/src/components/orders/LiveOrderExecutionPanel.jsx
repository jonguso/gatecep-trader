import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import OrderAuditTrail from "./OrderAuditTrail";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

const steps = ["QUEUED", "ROUTED", "ACCEPTED", "PARTIAL_FILL", "FILLED"];

function StatusBadge({ status }) {
  const className =
    status === "FILLED"
      ? "bg-green-600"
      : status === "PARTIAL_FILL"
      ? "bg-yellow-600"
      : status === "RETRYING"
      ? "bg-purple-600"
      : status === "REJECTED"
      ? "bg-red-600"
      : status === "CANCELLED"
      ? "bg-gray-600"
      : "bg-blue-600";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${className}`}>
      {status}
    </span>
  );
}
function ExecutionTimeline({ status }) {
  const currentIndex = steps.indexOf(status);

  return (
    <div className="flex items-center gap-2 mt-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full ${
              index <= currentIndex ? "bg-green-500" : "bg-slate-600"
            }`}
          />
          <span className="text-xs mx-1">{step}</span>
          {index < steps.length - 1 && <div className="w-6 h-px bg-slate-600" />}
        </div>
      ))}
    </div>
  );
}

function canCancel(order) {
  return !["FILLED", "REJECTED", "CANCELLED"].includes(order.status);
}

function FillIndicator({ order }) {
  const qty = Number(order.quantity || 0);
  const filledQty = Number(order.filledQuantity || 0);
  const pct = Number(order.fillPercent || 0);

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>Filled {filledQty}/{qty}</span>
        <span>{pct}%</span>
      </div>

      <div className="h-2 bg-slate-700 rounded-full">
        <div
          className="h-2 bg-green-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>

      {order.remainingQuantity > 0 && (
        <div className="text-xs text-yellow-400 mt-1">
          Remaining: {order.remainingQuantity}
        </div>
      )}

      {order.averageFillPrice > 0 && (
        <div className="text-xs text-slate-400 mt-1">
          Avg Fill: KES {order.averageFillPrice}
        </div>
      )}
    </div>
  );
}

export default function LiveOrderExecutionPanel() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  async function loadOrders() {
    const res = await fetch(`${API_URL}/execution/queue`);
    const data = await res.json();
    setOrders(data.queue || []);
  }
async function cancelOrder(orderId) {
  const res = await fetch(`${API_URL}/execution/${orderId}/cancel`, {
    method: "POST"
  });

  const data = await res.json();

  if (!data.ok) {
    alert(data.error || "Failed to cancel order");
    return;
  }

  setOrders((prev) =>
    prev.map((o) => (o.id === orderId ? data.order : o))
  );
}

  useEffect(() => {
    loadOrders();

    const socket = io(API_URL, {
      transports: ["websocket"]
         auth: {
         token
    });

    socket.on("connect", () => {
      console.log("Connected to order socket");
    });

    socket.on("connect_error", (error) => {
      console.error("Order socket connection error:", error.message);
    });

    socket.on("order:update", (updatedOrder) => {
      setOrders((prev) => {
        const exists = prev.some((o) => o.id === updatedOrder.id);

        if (exists) {
          return prev.map((o) =>
            o.id === updatedOrder.id ? updatedOrder : o
          );
        }

        return [updatedOrder, ...prev];
      });

      setSelectedOrder((current) =>
        current?.id === updatedOrder.id ? updatedOrder : current
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl">
      <h2 className="text-xl font-bold mb-4">Live Broker Execution Queue</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="text-left py-2">Order</th>
              <th className="text-left py-2">Broker</th>
              <th className="text-left py-2">Routing</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Progress</th>
              <th className="text-left py-2">Fill</th>
              <th className="text-left py-2">Audit</th>
	      <th className="text-left py-2">Action</th>

            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-800">
                <td className="py-3">
                  <div className="font-semibold">
                    {order.symbol} {order.side}
                  </div>
                  <div className="text-xs text-slate-400">
                    {order.quantity} @ KES {order.price}
                  </div>
                </td>

                <td className="py-3">
                  {order.broker || order.brokerId || "ABC"}
                </td>

                <td className="py-3">
                  <div className="text-xs">
                    Broker Status:
                    <span className="ml-1 font-semibold">
                      {order.brokerStatus || "PENDING"}
                    </span>
                  </div>
{order.rejectionReason && (
  <div className="text-xs text-red-400 mt-1">
    Reason: {order.rejectionReason}
  </div>
)}
                  <div className="text-xs text-slate-400">
                    Route: Gatecep → Broker → NSE
                  </div>
                </td>

                <td className="py-3">
                  <StatusBadge status={order.status} />
                </td>

                <td className="py-3 min-w-[360px]">
                  <ExecutionTimeline status={order.status} />
                </td>

                <td className="py-3 min-w-[160px]">
                  <FillIndicator order={order} />
                </td>

                <td className="py-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs"
                  >
                    View
                  </button>
                </td>
<td className="py-3">
  <button
    onClick={() => cancelOrder(order.id)}
    disabled={!canCancel(order)}
    className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-400 text-xs"
  >
    Cancel
  </button>
</td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan="8" className="py-6 text-center text-slate-400">
                  No pending or executed orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <OrderAuditTrail
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}