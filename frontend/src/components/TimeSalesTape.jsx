import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

const symbols = [
  "ALL",
  "SCOM",
  "KCB",
  "EQTY",
  "COOP",
  "EABL",
  "BAT"
];

function isBlockTrade(trade) {
  return Number(trade.quantity || 0) >= 500;
}

export default function TimeSalesTape() {
  const [trades, setTrades] = useState([]);
  const [selectedSymbol, setSelectedSymbol] =
    useState("ALL");
  const [lastTradeId, setLastTradeId] =
    useState(null);

  async function loadTrades() {
    try {
      const res = await fetch(
        `${API_URL}/time-sales`
      );

      const data = await res.json();

      if (data.ok) {
        setTrades(data.trades || []);
      }
    } catch (error) {
      console.error(
        "Failed to load time sales:",
        error
      );
    }
  }

  useEffect(() => {
    loadTrades();

    const token =
      localStorage.getItem("gatecep_token");

    const socket = io(API_URL, {
      transports: ["websocket"],
      auth: {
        token
      }
    });

    socket.on("time-sales:trade", (trade) => {
      setLastTradeId(trade.id);

      setTrades((prev) => {
        const exists = prev.some(
          (item) => item.id === trade.id
        );

        if (exists) {
          return prev;
        }

        return [trade, ...prev].slice(0, 150);
      });

      setTimeout(() => {
        setLastTradeId(null);
      }, 900);
    });

    return () => {
      socket.off("time-sales:trade");
      socket.disconnect();
    };
  }, []);

  const filteredTrades = useMemo(() => {
    if (selectedSymbol === "ALL") {
      return trades;
    }

    return trades.filter(
      (trade) => trade.symbol === selectedSymbol
    );
  }, [trades, selectedSymbol]);

  const stats = useMemo(() => {
    const volumeBySymbol = {};
    let totalValue = 0;
    let blockTrades = 0;

    for (const trade of filteredTrades) {
      volumeBySymbol[trade.symbol] =
        (volumeBySymbol[trade.symbol] || 0) +
        Number(trade.quantity || 0);

      totalValue += Number(trade.value || 0);

      if (isBlockTrade(trade)) {
        blockTrades += 1;
      }
    }

    return {
      volumeBySymbol,
      totalValue,
      blockTrades
    };
  }, [filteredTrades]);

  return (
    <div className="bg-slate-900 rounded-2xl p-5 shadow-xl text-white mt-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold">
            Institutional Time & Sales
          </h2>

          <p className="text-xs text-slate-400">
            Live executed trades, block detection, broker attribution and running volume
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {symbols.map((symbol) => (
            <button
              key={symbol}
              onClick={() =>
                setSelectedSymbol(symbol)
              }
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                selectedSymbol === symbol
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
            >
              {symbol}
            </button>
          ))}

          <div className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 border border-green-500 text-green-400">
            LIVE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-400">
            Running Value
          </div>

          <div className="text-lg font-bold text-cyan-400">
            KES{" "}
            {Number(stats.totalValue || 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-400">
            Block Trades
          </div>

          <div className="text-lg font-bold text-yellow-400">
            {stats.blockTrades}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-3">
          <div className="text-xs text-slate-400">
            Running Volume
          </div>

          <div className="text-lg font-bold text-green-400">
            {Object.entries(stats.volumeBySymbol)
              .map(
                ([symbol, volume]) =>
                  `${symbol}: ${Number(
                    volume
                  ).toLocaleString()}`
              )
              .join(" | ") || "0"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2 text-xs text-slate-400 border-b border-slate-700 pb-2 mb-2">
        <div>TIME</div>
        <div>SYMBOL</div>
        <div>SIDE</div>
        <div>QTY</div>
        <div>PRICE</div>
        <div>VALUE</div>
        <div>BROKER</div>
        <div>FLAGS</div>
      </div>

      <div className="space-y-2 max-h-[460px] overflow-y-auto">
        {filteredTrades.map((trade) => {
          const isBuy = trade.side === "BUY";
          const block = isBlockTrade(trade);
          const isNew = trade.id === lastTradeId;

          return (
            <div
              key={trade.id}
              className={`grid grid-cols-8 gap-2 text-sm border-b border-slate-800 pb-2 rounded-lg px-1 transition-all ${
                isNew
                  ? isBuy
                    ? "bg-green-500/20 border-green-500"
                    : "bg-red-500/20 border-red-500"
                  : "hover:bg-slate-800/70"
              }`}
            >
              <div className="text-slate-400">
                {new Date(
                  trade.executedAt
                ).toLocaleTimeString()}
              </div>

              <div className="font-bold">
                {trade.symbol}
              </div>

              <div
                className={
                  isBuy
                    ? "text-green-400 font-bold"
                    : "text-red-400 font-bold"
                }
              >
                {trade.side}
              </div>

              <div>
                {Number(
                  trade.quantity || 0
                ).toLocaleString()}
              </div>

              <div>
                KES{" "}
                {Number(
                  trade.price || 0
                ).toFixed(2)}
              </div>

              <div className="text-cyan-400">
                KES{" "}
                {Number(
                  trade.value || 0
                ).toLocaleString()}
              </div>

              <div className="text-purple-400">
                {trade.broker}
              </div>

              <div>
                {block ? (
                  <span className="px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500 text-yellow-300 text-xs">
                    BLOCK
                  </span>
                ) : (
                  <span className="text-slate-500">
                    NORMAL
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredTrades.length === 0 && (
          <div className="text-center text-slate-500 py-10">
            No trades yet
          </div>
        )}
      </div>
    </div>
  );
}