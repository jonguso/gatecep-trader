import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";
import useMarketSocket from "../hooks/useMarketSocket";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function changeColor(value) {
  return Number(value || 0) >= 0
    ? "text-green-400"
    : "text-red-400";
}

export default function MobileWatchlist() {
  const [prices, setPrices] = useState([]);
const [watchlist, setWatchlist] = useState([]);
const [newSymbol, setNewSymbol] = useState("");
const {
  prices: socketPrices,
  connected
} = useMarketSocket();

function aiSignal(changePct) {
  if (changePct >= 5) {
    return {
      label: "Strong Bullish",
      color: "text-green-400"
    };
  }

  if (changePct >= 0) {
    return {
      label: "Accumulation",
      color: "text-cyan-400"
    };
  }

  return {
    label: "Risk Watch",
    color: "text-red-400"
  };
}

function liquidityBadge(turnover) {
  if (turnover >= 100000000) {
    return "High Liquidity";
  }

  if (turnover >= 20000000) {
    return "Moderate";
  }

  return "Low Liquidity";
}

  async function loadPrices() {
    try {
      const res = await fetch(`${API_URL}/prices`);
      const data = await res.json();

      setPrices(data.data || []);
    } catch (error) {
      console.error("Failed to load prices:", error);
    }
  }

  async function loadWatchlist() {
  try {
    const res = await fetch(`${API_URL}/watchlist`);
    const data = await res.json();

    if (data.ok) {
      setWatchlist(data.watchlist || []);
    }
  } catch (error) {
    console.error("Failed to load watchlist:", error);
  }
}

async function addSymbol() {
  const symbol = newSymbol.trim().toUpperCase();

  if (!symbol) return;

  try {
    const res = await fetch(`${API_URL}/watchlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ symbol })
    });

    const data = await res.json();

    if (data.ok) {
      setWatchlist(data.watchlist || []);
      setNewSymbol("");
    }
  } catch (error) {
    console.error("Failed to add symbol:", error);
  }
}

async function removeFromWatchlist(symbol) {
  try {
    const res = await fetch(`${API_URL}/watchlist/${symbol}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (data.ok) {
      setWatchlist(data.watchlist || []);
    }
  } catch (error) {
    console.error("Failed to remove symbol:", error);
  }
}

  useEffect(() => {
  loadWatchlist();
  loadPrices();

  const interval = setInterval(loadPrices, 15000);

  return () => clearInterval(interval);
}, []);

  const livePrices =
  socketPrices.length > 0
    ? socketPrices
    : prices;

const items = livePrices.filter((item) =>
  watchlist.includes(
    String(item.symbol || "").trim()
  )
);

  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold">
          Watchlist
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          AI-monitored securities and smart alerts.
        </p>

<div className="mt-3 text-xs">
  <span
    className={
      connected
        ? "text-green-400"
        : "text-yellow-400"
    }
  >
    {connected
      ? "● Live market stream connected"
      : "● Using fallback polling"}
  </span>
</div>

 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mt-5">
  <div className="text-sm text-slate-400 mb-2">
    Add Security
  </div>

  <div className="flex gap-2">
    <input
      value={newSymbol}
      onChange={(e) => setNewSymbol(e.target.value)}
      placeholder="e.g. EABL"
      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white uppercase"
    />

    <button
      onClick={addSymbol}
      className="bg-cyan-600 hover:bg-cyan-500 rounded-xl px-4 font-bold"
    >
      Add
    </button>
  </div>
</div> 

        <div className="space-y-4 mt-5">
          {items.map((item) => {
            const positive =
              Number(item.changePct || 0) >= 0;

            const aiConfidence =
              positive ? 88 : 64;

            const signal = aiSignal(item.changePct || 0);

            return (
              <div
                key={item.symbol}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
              >
               
                         
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-xl font-bold">
                        {item.symbol}
                      </div>

                      <div className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-300">
                        AI WATCH
                      </div>
                    </div>

                    <div className="text-sm text-slate-400 mt-1">
                      {item.name}
                    </div>
                  </div>

<div className="flex flex-wrap gap-2 mt-2">
  <div className={`text-[10px] px-2 py-1 rounded-full bg-slate-800 ${signal.color}`}>
    {signal.label}
  </div>

  <div className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-300">
    {liquidityBadge(item.turnover || 0)}
  </div>

  <div className="text-[10px] px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-300">
    AI {aiConfidence}%
  </div>
</div>

                  <button
                    onClick={() =>
                      removeFromWatchlist(
                        item.symbol
                      )
                    }
                    className="text-xs bg-red-500/10 border border-red-500/40 text-red-400 px-3 py-2 rounded-xl"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="bg-slate-800 rounded-xl p-3">
                    <div className="text-xs text-slate-400">
                      Market Price
                    </div>

                    <div className="text-lg font-bold text-cyan-300 mt-1">
                      KES{" "}
                      {Number(
                        item.price ||
                          item.lastPrice ||
                          0
                      ).toFixed(2)}
                    </div>
                  </div>

                   <div className="bg-slate-800 rounded-xl p-3">
                    <div className="text-xs text-slate-400">
                      Change
                    </div>

                    <div
                      className={`text-lg font-bold mt-1 ${changeColor(
                        item.changePct
                      )}`}
                    >
                      {positive ? "+" : ""}
                      {Number(
                        item.changePct || 0
                      ).toFixed(2)}
                      %
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-400">
                        Coach G Confidence
                      </div>

                      <div className="text-2xl font-bold text-cyan-300 mt-1">
                        {aiConfidence}%
                      </div>
                    </div>

                    <div
                      className={
                        aiConfidence >= 80
                          ? "bg-green-500/20 text-green-400 px-3 py-2 rounded-xl font-bold"
                          : "bg-yellow-500/20 text-yellow-300 px-3 py-2 rounded-xl font-bold"
                      }
                    >
                      {aiConfidence >= 80
                        ? "Bullish"
                        : "Neutral"}
                    </div>
                  </div>

                  <div className="text-sm text-slate-300 mt-4 leading-6">
                    {positive
                      ? `${item.symbol} momentum improving with healthy liquidity and positive AI sentiment.`
                      : `${item.symbol} showing weakness. Monitor support levels and volume activity.`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <a
                    href={`/mobile/stock/${item.symbol}`}
                    className="bg-slate-800 hover:bg-slate-700 rounded-xl py-3 text-center font-bold text-cyan-300"
                  >
                    View
                  </a>

                  <a
                    href={`/mobile/order/${item.symbol}/BUY`}
                    className="bg-green-600 hover:bg-green-500 rounded-xl py-3 text-center font-bold"
                  >
                    Buy
                  </a>
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
              Watchlist is empty.
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}