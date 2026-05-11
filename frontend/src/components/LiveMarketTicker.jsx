import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function LiveMarketTicker() {
  const [ticks, setTicks] = useState([]);

  useEffect(() => {
   io(API_URL, {
  transports: ["websocket"],
  auth: {
    token
  }
});

    socket.on("market:tick", (data) => {
      setTicks(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3 overflow-x-auto">
      <div className="flex gap-6 whitespace-nowrap">
        {ticks.map((tick) => (
          <div key={tick.symbol} className="flex items-center gap-2">
            <span className="font-bold">{tick.symbol}</span>

            <span>KES {tick.price}</span>

            <span
              className={
                tick.change >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {tick.change >= 0 ? "+" : ""}
              {tick.change} ({tick.changePct}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}