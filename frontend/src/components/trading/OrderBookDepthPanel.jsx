import { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function Row({
  side,
  price,
  quantity,
  maxQty
}) {
  const width =
    maxQty > 0
      ? `${(quantity / maxQty) * 100}%`
      : "0%";

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div
        className={`absolute inset-y-0 ${
          side === "bid"
            ? "left-0 bg-green-500/20"
            : "right-0 bg-red-500/20"
        }`}
        style={{
          width
        }}
      />

      <div className="relative z-10 flex justify-between px-3 py-2 text-xs">
        <span
          className={
            side === "bid"
              ? "text-green-300 font-bold"
              : "text-red-300 font-bold"
          }
        >
          KES {Number(price || 0).toFixed(2)}
        </span>

        <span className="text-slate-300">
          {Number(quantity || 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function OrderBookDepthPanel({
  symbol = "SCOM"
}) {
  const [depth, setDepth] = useState({
    bids: [],
    asks: []
  });

  async function loadDepth() {
    try {
      const res = await fetch(
        `${API_URL}/orderbook-depth/${symbol}`
      );

      const data = await res.json();

      if (data.ok) {
        setDepth(data.depth);
      }
    } catch (error) {
      console.error(
        "Failed to load order book:",
        error
      );
    }
  }

  useEffect(() => {
    loadDepth();

    const interval = setInterval(
      loadDepth,
      3000
    );

    return () => clearInterval(interval);
  }, [symbol]);

  const maxBidQty = Math.max(
    ...depth.bids.map(
      (row) => Number(row.quantity || 0)
    ),
    1
  );

  const maxAskQty = Math.max(
    ...depth.asks.map(
      (row) => Number(row.quantity || 0)
    ),
    1
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="text-xl font-bold">
            Order Book
          </div>

          <div className="text-xs text-slate-400">
            Live simulated liquidity depth
          </div>
        </div>

        <div className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-xs font-bold">
          {symbol}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-green-300 font-bold text-xs mb-2">
            BIDS
          </div>

          <div className="space-y-2">
            {depth.bids.map((row, index) => (
              <Row
                key={index}
                side="bid"
                price={row.price}
                quantity={row.quantity}
                maxQty={maxBidQty}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="text-red-300 font-bold text-xs mb-2">
            ASKS
          </div>

          <div className="space-y-2">
            {depth.asks.map((row, index) => (
              <Row
                key={index}
                side="ask"
                price={row.price}
                quantity={row.quantity}
                maxQty={maxAskQty}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 bg-slate-950/60 border border-slate-800 rounded-xl p-3">
        <div className="text-xs text-slate-400">
          Coach G Liquidity Insight
        </div>

        <div className="text-sm text-slate-300 mt-1 leading-6">
          Current order book shows deeper buy-side
          liquidity near market price. Large market
          sells may create temporary slippage.
        </div>
      </div>
    </div>
  );
}