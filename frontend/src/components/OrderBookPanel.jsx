import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function OrderBookPanel() {
  const [symbol, setSymbol] = useState("SCOM");
  const [book, setBook] = useState(null);

  async function loadBook() {
    const res = await fetch(`${API_URL}/order-book/${symbol}`);
    const data = await res.json();

    if (data.ok) {
      setBook(data.book);
    }
  }

  useEffect(() => {
    loadBook();

    const interval = setInterval(loadBook, 3000);

    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">NSE Market Depth</h2>

        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="bg-slate-800 rounded-xl p-2 text-white"
        >
          <option value="SCOM">SCOM</option>
          <option value="EQTY">EQTY</option>
          <option value="KCB">KCB</option>
          <option value="COOP">COOP</option>
        </select>
      </div>

      {book && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">Best Bid</div>
              <div className="text-2xl font-bold text-green-400">
                KES {book.bestBid}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">Best Ask</div>
              <div className="text-2xl font-bold text-red-400">
                KES {book.bestAsk}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">Spread</div>
              <div className="text-2xl font-bold text-cyan-400">
                KES {book.spread}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">Liquidity</div>
              <div className="text-2xl font-bold text-purple-400">
                {book.liquidityScore}/100
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <h3 className="font-bold text-green-400 mb-2">Top Bids</h3>
              {book.bids.map((level, index) => (
                <div
                  key={index}
                  className="flex justify-between border-b border-slate-800 py-2"
                >
                  <span>KES {level.price}</span>
                  <span>{level.quantity}</span>
                </div>
              ))}
            </div>

            <div>
              <h3 className="font-bold text-red-400 mb-2">Top Asks</h3>
              {book.asks.map((level, index) => (
                <div
                  key={index}
                  className="flex justify-between border-b border-slate-800 py-2"
                >
                  <span>KES {level.price}</span>
                  <span>{level.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 text-sm text-slate-400">
            Market Impact Estimate: {book.marketImpactEstimate}%
          </div>
        </>
      )}
    </div>
  );
}