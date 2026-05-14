import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

const symbols = ["SCOM", "KCB", "EQTY", "COOP"];

export default function Level2OrderBook() {
  const [symbol, setSymbol] = useState("SCOM");
  const [book, setBook] = useState({
    bids: [],
    asks: []
  });

  async function loadBook(selectedSymbol = symbol) {
    try {
      const res = await fetch(
        `${API_URL}/matching/book/${selectedSymbol}`
      );

      const data = await res.json();

      if (data.ok) {
        setBook(data.book || { bids: [], asks: [] });
      }
    } catch (error) {
      console.error("Failed to load order book:", error);
    }
  }

  useEffect(() => {
  loadBook(symbol);

  const token =
    localStorage.getItem("gatecep_token");

  const socket = io(API_URL, {
    transports: ["websocket"],
    auth: {
      token
    }
  });

  socket.on("orderbook:update", (payload) => {
    if (payload.symbol !== symbol) return;

    setBook(payload.book || { bids: [], asks: [] });
  });

  return () => {
    socket.off("orderbook:update");
    socket.disconnect();
  };
}, [symbol]);
  const metrics = useMemo(() => {
    const bestBid = book.bids?.[0]?.price || 0;
    const bestAsk = book.asks?.[0]?.price || 0;

    const bidVolume = (book.bids || []).reduce(
      (sum, row) => sum + Number(row.quantity || 0),
      0
    );

    const askVolume = (book.asks || []).reduce(
      (sum, row) => sum + Number(row.quantity || 0),
      0
    );

    const totalDepth = bidVolume + askVolume;

    const imbalance =
      totalDepth > 0
        ? Number((((bidVolume - askVolume) / totalDepth) * 100).toFixed(2))
        : 0;

    return {
      bestBid,
      bestAsk,
      spread: bestAsk && bestBid ? Number((bestAsk - bestBid).toFixed(2)) : 0,
      bidVolume,
      askVolume,
      imbalance
    };
  }, [book]);

  const maxQty = useMemo(() => {
    const rows = [...(book.bids || []), ...(book.asks || [])];

    return Math.max(
      1,
      ...rows.map((row) => Number(row.quantity || 0))
    );
  }, [book]);

  function DepthRow({ row, side }) {
    const qty = Number(row.quantity || 0);
    const pct = Math.min(100, (qty / maxQty) * 100);
    const isBid = side === "BID";

    return (
      <div className="relative grid grid-cols-3 gap-3 py-2 px-3 border-b border-slate-800 overflow-hidden">
        <div
          className={`absolute inset-y-0 ${
            isBid ? "right-0 bg-green-500/15" : "left-0 bg-red-500/15"
          }`}
          style={{ width: `${pct}%` }}
        />

        <div
          className={`relative font-bold ${
            isBid ? "text-green-400" : "text-red-400"
          }`}
        >
          KES {Number(row.price || 0).toFixed(2)}
        </div>

        <div className="relative text-right">
          {qty.toLocaleString()}
        </div>

        <div className="relative text-right text-slate-400">
          KES {(qty * Number(row.price || 0)).toLocaleString()}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-bold">
            Level 2 Market Depth
          </h2>

          <p className="text-slate-400 text-sm">
            Live bid/ask ladder, spread, depth imbalance, and liquidity heatmap
          </p>
        </div>

        <select
          value={symbol}
          onChange={(event) => setSymbol(event.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
        >
          {symbols.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Best Bid</div>
          <div className="text-2xl font-bold text-green-400">
            KES {metrics.bestBid.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Best Ask</div>
          <div className="text-2xl font-bold text-red-400">
            KES {metrics.bestAsk.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Spread</div>
          <div className="text-2xl font-bold text-cyan-400">
            KES {metrics.spread.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Depth Imbalance</div>
          <div
            className={`text-2xl font-bold ${
              metrics.imbalance >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {metrics.imbalance}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 font-bold text-green-400 border-b border-slate-800">
            Bids
          </div>

          <div className="grid grid-cols-3 gap-3 px-3 py-2 text-xs text-slate-400 border-b border-slate-800">
            <div>Price</div>
            <div className="text-right">Quantity</div>
            <div className="text-right">Value</div>
          </div>

          {(book.bids || []).map((row, index) => (
            <DepthRow key={`bid-${index}`} row={row} side="BID" />
          ))}
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 font-bold text-red-400 border-b border-slate-800">
            Asks
          </div>

          <div className="grid grid-cols-3 gap-3 px-3 py-2 text-xs text-slate-400 border-b border-slate-800">
            <div>Price</div>
            <div className="text-right">Quantity</div>
            <div className="text-right">Value</div>
          </div>

          {(book.asks || []).map((row, index) => (
            <DepthRow key={`ask-${index}`} row={row} side="ASK" />
          ))}
        </div>
      </div>
    </div>
  );
}