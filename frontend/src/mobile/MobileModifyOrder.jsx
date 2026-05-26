import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function formatMoney(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

export default function MobileModifyOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  async function loadOrder() {
    try {
      const res = await fetch(`${API_URL}/execution/queue`);
      const data = await res.json();

      const orders = data.orders || data.queue || [];
      const found = orders.find((item) => item.id === id);

      if (found) {
        setOrder(found);
        setQuantity(found.quantity);
        setPrice(found.price);
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function saveChanges() {
    try {
  const res = await fetch(
    `${API_URL}/orders/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        quantity: Number(quantity),
        price: Number(price)
      })
    }
  );

  const data = await res.json();

  if (!data.ok) {
    setMessage(
      data.error || "Modify failed"
    );
    return;
  }

  setMessage(
    "Order modified successfully."
  );
} catch (error) {
  setMessage(error.message);
}
  }

  useEffect(() => {
    loadOrder();
  }, [id]);

  if (!order) {
    return (
      <div className="bg-slate-950 min-h-screen text-white p-4">
        Loading order...
      </div>
    );
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white pb-24">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Modify Order</h1>
            <p className="text-slate-400 text-sm mt-1">
              Adjust quantity or bid price before execution completes.
            </p>
          </div>

          <button
            onClick={() => navigate("/mobile/orders")}
            className="bg-slate-800 rounded-xl px-4 py-2 text-cyan-300 font-bold text-sm"
          >
            ✕ Close
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mt-5">
          <div className="flex justify-between">
            <div>
              <div className="text-slate-400 text-xs">Security</div>
              <div className="text-3xl font-bold">{order.symbol}</div>
            </div>

            <div
              className={
                order.side === "BUY"
                  ? "text-green-300 text-3xl font-bold"
                  : "text-red-300 text-3xl font-bold"
              }
            >
              {order.side}
            </div>
          </div>

          <div className="text-xs text-slate-500 mt-3">
            {order.id}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div>
              <label className="text-sm text-slate-400">
                Quantity
              </label>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                inputMode="numeric"
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Limit Price
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                inputMode="decimal"
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
              />
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-4 mt-5">
            <div className="text-cyan-300 font-bold">
              Revised Order Value
            </div>
            <div className="text-2xl font-bold mt-2">
              {formatMoney(Number(quantity || 0) * Number(price || 0))}
            </div>
          </div>

          <button
            onClick={saveChanges}
            className="w-full bg-cyan-500 text-slate-950 rounded-2xl py-4 mt-5 font-bold"
          >
            Save Changes
          </button>

          {message && (
            <div className="mt-4 bg-slate-800 rounded-xl p-3 text-sm text-cyan-300">
              {message}
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}