import { useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

const brokers = [
  "AUTO",
  "AIB",
  "ABC",
  "NCBA"
];

export default function AdvancedOrderTicket() {
  const [symbol, setSymbol] = useState("SCOM");
  const [side, setSide] = useState("BUY");
  const [quantity, setQuantity] = useState(100);
  const [price, setPrice] = useState(18.45);
  const [broker, setBroker] = useState("AUTO");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submitOrder() {
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

      const res = await fetch(
        `${API_URL}/execution/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!data.ok) {
        setMessage(
          data.error || "Order failed"
        );

        return;
      }

      setMessage(
        `Order submitted successfully (${data.order.id})`
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white">
      <h2 className="text-2xl font-bold mb-5">
        Advanced Order Ticket
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-slate-400">
            Symbol
          </label>

          <select
            value={symbol}
            onChange={(e) =>
              setSymbol(e.target.value)
            }
            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
          >
            <option value="SCOM">SCOM</option>
            <option value="KCB">KCB</option>
            <option value="EQTY">EQTY</option>
            <option value="COOP">COOP</option>
            <option value="EABL">EABL</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-400">
            Side
          </label>

          <select
            value={side}
            onChange={(e) =>
              setSide(e.target.value)
            }
            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>

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
            Price
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

        <div className="md:col-span-2">
          <label className="text-sm text-slate-400">
            Broker Routing
          </label>

          <select
            value={broker}
            onChange={(e) =>
              setBroker(e.target.value)
            }
            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
          >
            {brokers.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>

          <div className="text-xs text-slate-500 mt-2">
            AUTO uses Smart Broker Routing
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={submitOrder}
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-bold text-lg ${
            side === "BUY"
              ? "bg-green-600 hover:bg-green-500"
              : "bg-red-600 hover:bg-red-500"
          }`}
        >
          {loading
            ? "Submitting..."
            : `${side} ${symbol}`}
        </button>
      </div>

      {message && (
        <div className="mt-4 text-sm text-cyan-400">
          {message}
        </div>
      )}
    </div>
  );
}