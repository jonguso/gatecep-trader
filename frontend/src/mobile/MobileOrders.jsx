import { useEffect, useState } from "react";
import MobileBottomNav from "../components/mobile/MobileBottomNav";
const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

const pendingStatuses = [
  "QUEUED",
  "ROUTED",
  "ACCEPTED",
  "PARTIAL_FILL",
  "PENDING_MARKET_OPEN"
];

function formatMoney(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

export default function MobileOrders() {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("ALL");
  const [message, setMessage] = useState("");

  async function loadOrders() {
  try {
    const res = await fetch(`${API_URL}/execution/queue`);
    const data = await res.json();

    if (Array.isArray(data)) {
      setOrders(data);
      return;
    }

    if (data.ok) {
      setOrders(data.orders || data.queue || []);
    }
  } catch (error) {
    console.error("Failed to load orders:", error);
  }
}

  async function cancel(id) {
    try {
      const res = await fetch(`${API_URL}/orders/${id}/cancel`, {
        method: "POST"
      });

      const data = await res.json();

      if (!data.ok) {
        setMessage(data.error || "Cancel failed");
        return;
      }

      setMessage("Order cancelled.");
      loadOrders();
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadOrders();

    const interval = setInterval(loadOrders, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (tab === "ALL") return true;
    if (tab === "PENDING") return pendingStatuses.includes(order.status);
    return order.status === tab;
  });

  return (
    <div className="bg-slate-950 min-h-screen text-white pb-24">
      <div className="p-4">
        <h1 className="text-3xl font-bold">Orders</h1>

        <p className="text-slate-400 text-sm mt-1">
          Review, modify, or cancel working orders.
        </p>

        <div className="grid grid-cols-5 gap-2 mt-5 text-xs">
          {["ALL", "PENDING", "FILLED", "CANCELLED", "REJECTED"].map(
            (item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={
                  tab === item
                    ? "bg-cyan-500 text-slate-950 rounded-xl py-2 font-bold"
                    : "bg-slate-800 text-slate-300 rounded-xl py-2"
                }
              >
                {item}
              </button>
            )
          )}
        </div>

        {message && (
          <div className="bg-slate-800 rounded-xl p-3 text-cyan-300 text-sm mt-4">
            {message}
          </div>
        )}

        <div className="space-y-4 mt-5">
          {filteredOrders.map((order) => {
            const canModify = pendingStatuses.includes(order.status);

            return (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          order.side === "BUY"
                            ? "bg-green-500/20 text-green-300 px-2 py-1 rounded-lg text-xs font-bold"
                            : "bg-red-500/20 text-red-300 px-2 py-1 rounded-lg text-xs font-bold"
                        }
                      >
                        {order.side}
                      </span>

                      <div className="text-xl font-bold">
                        {order.symbol}
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 mt-2">
                      {order.id}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">
                      Status
                    </div>

                    <div className="font-bold text-cyan-300">
                      {order.status}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Metric label="Quantity" value={order.quantity} />
                  <Metric label="Filled" value={order.filledQuantity || 0} />
                  <Metric label="Price" value={formatMoney(order.price)} />
                  <Metric
                    label="Avg Fill"
                    value={formatMoney(order.averageFillPrice)}
                  />
                </div>

                <div className="mt-4 text-sm text-slate-300">
                  Broker:{" "}
                  <span className="font-bold text-cyan-300">
                    {order.broker}
                  </span>
                </div>

               <div className="mt-4">
  <div className="flex items-center justify-between text-[10px] text-slate-500">
    <span>QUEUED</span>
    <span>ROUTED</span>
    <span>ACCEPTED</span>
    <span>FILLED</span>
  </div>

  <div className="relative h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
    <div
      className="absolute left-0 top-0 h-2 bg-cyan-400 rounded-full transition-all duration-500"
      style={{
        width:
          order.status === "QUEUED"
            ? "20%"
            : order.status === "ROUTED"
            ? "45%"
            : order.status === "ACCEPTED"
            ? "70%"
            : order.status === "PARTIAL_FILL"
            ? "85%"
            : order.status === "FILLED"
            ? "100%"
            : "0%"
      }}
    />
  </div>
</div>

<div className="flex justify-between text-xs text-slate-400 mt-2">
  <span>
    Filled: {order.filledQuantity || 0}
  </span>

  <span>
    Remaining: {order.remainingQuantity || 0}
  </span>

  <span className="text-cyan-300 font-bold">
    {order.fillPercent || 0}%
  </span>
</div>

                {canModify && (
                  <div className="grid grid-cols-2 gap-3 mt-4">

                    <button
  onClick={() => {
    window.location.href = `/mobile/orders/${order.id}/modify`;
  }}
  className="bg-green-500/20 border border-green-500/40 text-green-300 rounded-xl py-3 text-center font-bold"
>
  Modify
</button>

                    <button
                      onClick={() => cancel(order.id)}
                      className="bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl py-3 font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {filteredOrders.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
              No orders found.
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-slate-800 rounded-xl p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="font-bold mt-1">{value}</div>
    </div>
  );
}