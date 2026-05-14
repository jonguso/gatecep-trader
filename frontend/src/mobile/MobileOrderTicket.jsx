import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MobileBuyingPowerBar from "./MobileBuyingPowerBar";
import SwipeTradeButton from "../components/mobile/SwipeTradeButton";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileOrderTicket() {
  const { symbol, side } = useParams();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(100);
  const [price, setPrice] = useState(18.45);
  const [broker, setBroker] = useState("AUTO");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [execution, setExecution] = useState(null);

  const estimatedValue =
    Number(quantity || 0) * Number(price || 0);

  async function executeOrder() {
    try {
      setLoading(true);
      setMessage("");

      const payload = {
        symbol,
        side,
        quantity: Number(quantity),
        price: Number(price)
      };

      if (broker !== "AUTO") {
        payload.broker = broker;
      }

      const res = await fetch(`${API_URL}/execution/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!data.ok) {
        setMessage(data.error || "Order failed");
        return;
      }

      setOrderId(data.order.id);
      setExecution(data.order);
      setMessage(`Order submitted: ${data.order.id}`);

setTimeout(() => {
  navigate(`/mobile/stock/${symbol}`);
}, 6000);

    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/execution/queue`);
        const data = await res.json();

        const queue = data.queue || data.orders || [];

        const found = queue.find(
          (item) => item.id === orderId
        );

        if (found) {
          setExecution(found);
        }
      } catch (error) {
        console.error("Execution polling failed:", error);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="bg-slate-950 min-h-screen text-white pb-24">
      <MobileBuyingPowerBar />

      <div className="p-4">
        <a
          href={`/mobile/stock/${symbol}`}
          className="text-cyan-400 text-sm"
        >
          ← Back to {symbol}
        </a>

        <div className="bg-slate-900 rounded-2xl p-5 mt-4 border border-slate-800">
          <div className="flex justify-between">
            <div>
              <div className="text-slate-400 text-sm">
                Order
              </div>

              <div className="text-4xl font-bold">
                {symbol}
              </div>
            </div>

            <div
              className={
                side === "BUY"
                  ? "text-green-400 text-4xl font-bold"
                  : "text-red-400 text-4xl font-bold"
              }
            >
              {side}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div>
              <label className="text-sm text-slate-400">
                Quantity
              </label>

              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">
                Limit Price
              </label>

              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm text-slate-400">
              Broker
            </label>

            <select
              value={broker}
              onChange={(e) =>
                setBroker(e.target.value)
              }
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
            >
              <option value="AUTO">
                AUTO - Coach G Smart Routing
              </option>
              <option value="AIB">AIB</option>
              <option value="ABC">ABC</option>
              <option value="NCBA">NCBA</option>
            </select>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 mt-5">
            <div className="text-xs text-slate-400">
              Estimated Order Value
            </div>

            <div className="text-2xl font-bold text-cyan-400">
              KES {estimatedValue.toLocaleString()}
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500 rounded-2xl p-4 mt-5">
            <div className="text-cyan-400 font-bold">
              Coach G Execution Check
            </div>

            <div className="text-sm text-slate-300 mt-2 leading-6">
              Smart routing will use the best available broker when AUTO is selected.
              Check quantity, liquidity, and buying power before confirming.
            </div>
          </div>

          <div className="mt-5">
            <SwipeTradeButton
              text={
                loading
                  ? "Submitting..."
                  : `Swipe To ${side}`
              }
              color={
                side === "BUY"
                  ? "bg-green-500"
                  : "bg-red-500"
              }
              onComplete={executeOrder}
            />
          </div>

          {message && (
            <div className="mt-4 bg-slate-800 rounded-xl p-3 text-sm text-cyan-300">
              {message}
            </div>
          )}
        </div>

        {execution && (
          <div className="bg-slate-900 rounded-2xl p-5 mt-5 border border-cyan-500/30">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-cyan-400 font-bold">
                  Live Execution
                </div>

                <div className="text-xs text-slate-400">
                  {execution.id}
                </div>
              </div>

              <div className="text-sm font-bold text-cyan-300">
                {execution.status}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Fill Progress</span>
                <span>{execution.fillPercent || 0}%</span>
              </div>

              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-green-400 rounded-full"
                  style={{
                    width: `${execution.fillPercent || 0}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {(execution.executionEvents || []).map(
                (event, index) => (
                  <div
                    key={`${event.status}-${index}`}
                    className="flex gap-3 items-start"
                  >
                    <div className="w-3 h-3 rounded-full bg-cyan-400 mt-1 animate-pulse" />

                    <div>
                      <div className="font-bold text-sm">
                        {event.status}
                      </div>

                      <div className="text-xs text-slate-400">
                        {event.message}
                      </div>
                    </div>
		<MobileBottomNav />
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}