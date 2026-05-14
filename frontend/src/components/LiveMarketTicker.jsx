import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function LiveMarketTicker() {
  const [ticks, setTicks] = useState([]);

  async function loadPrices() {
    try {
      const res = await fetch(`${API_URL}/prices`);
      const data = await res.json();

      setTicks(data.data || []);
    } catch (error) {
      console.error("Failed to load market prices:", error);
    }
  }

  useEffect(() => {
    loadPrices();

    const token =
      localStorage.getItem("gatecep_token");

    const socket = io(API_URL, {
      transports: ["websocket"],
      auth: {
        token
      }
    });

    socket.on("market:tick", (data) => {
      setTicks(data || []);
    });

    return () => {
      socket.off("market:tick");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-white overflow-hidden">
      <div className="flex items-center gap-10 px-5 py-3 whitespace-nowrap animate-[ticker_90s_linear_infinite]">
        {ticks.map((tick) => {
          const change =
            Number(tick.change || 0);

          const changePct =
            Number(tick.changePct || 0);

          return (
            <div
              key={tick.symbol}
              className="flex items-center gap-2 text-sm"
            >
              <span className="font-bold text-white">
                {tick.symbol}
              </span>

              <span className="text-slate-200">
                KES {Number(tick.price || tick.lastPrice || 0).toFixed(2)}
              </span>

              <span
                className={
                  change >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {change >= 0 ? "▲" : "▼"} {change.toFixed(2)} ({changePct.toFixed(2)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}