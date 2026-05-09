import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function WatchlistPanel() {
  const [items, setItems] = useState([]);

  async function loadWatchlist() {
    const res = await fetch(`${API_URL}/watchlist`);
    const data = await res.json();

    if (data.ok) {
      setItems(data.watchlist || []);
    }
  }

  useEffect(() => {
    loadWatchlist();

    const interval = setInterval(loadWatchlist, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-5">
        Watchlist + Coach G Alerts
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.symbol}
            className="bg-slate-800 rounded-xl p-5 border border-slate-700"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-2xl font-bold">
                {item.symbol}
              </div>

              {item.hot && (
                <span className="text-xs bg-orange-600 rounded-full px-2 py-1">
                  HOT
                </span>
              )}
            </div>

            <div className="text-xl font-bold">
              KES {item.price}
            </div>

            <div
              className={
                item.change >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {item.change >= 0 ? "+" : ""}
              {item.change} ({item.changePct}%)
            </div>

            <div className="mt-3 text-sm text-slate-400">
              Coach G
            </div>

            <div className="font-bold text-cyan-400">
              {item.recommendation}
            </div>

            <div className="text-sm text-slate-300">
              Confidence: {item.confidence}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}