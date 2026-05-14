import { useState } from "react";
import { useParams } from "react-router-dom";
import MobileBuyingPowerBar from "./MobileBuyingPowerBar";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileOrderConfirm() {
  const { symbol, side } = useParams();

  const [quantity, setQuantity] = useState(100);
  const [price, setPrice] = useState(18.45);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function executeOrder() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API_URL}/execution/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          symbol,
          side,
          quantity: Number(quantity),
          price: Number(price)
        })
      });

      const data = await res.json();

      if (!data.ok) {
        setMessage(data.error || "Order failed");
        return;
      }

      setMessage(`Order submitted: ${data.order.id}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-950 min-h-screen text-white pb-24">
      <MobileBuyingPowerBar />

      <div className="p-4">
        <h1 className="text-3xl font-bold">
          Confirm Order
        </h1>

        <div className="bg-slate-900 rounded-2xl p-5 mt-5">
          <div className="flex justify-between mb-4">
            <div>
              <div className="text-slate-400 text-sm">
                Symbol
              </div>

              <div className="text-3xl font-bold">
                {symbol}
              </div>
            </div>

            <div
              className={
                side === "BUY"
                  ? "text-green-400 text-3xl font-bold"
                  : "text-red-400 text-3xl font-bold"
              }
            >
              {side}
            </div>
          </div>

          <label className="text-sm text-slate-400">
            Quantity
          </label>

          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full mt-1 mb-4 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
          />

          <label className="text-sm text-slate-400">
            Limit Price
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full mt-1 mb-4 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
          />

          <div className="bg-cyan-500/10 border border-cyan-500 rounded-xl p-4 mb-4">
            <div className="text-cyan-400 font-bold">
              Coach G Check
            </div>

            <div className="text-sm text-slate-300 mt-2">
              Default broker will be used. Estimated order value is KES{" "}
              {(Number(quantity) * Number(price)).toLocaleString()}.
            </div>
          </div>

          <button
            onClick={executeOrder}
            disabled={loading}
            className={`w-full rounded-2xl py-4 font-bold text-lg ${
              side === "BUY"
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            {loading ? "Submitting..." : "Confirm Execute"}
          </button>

          {message && (
            <div className="mt-4 text-cyan-400 text-sm">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}