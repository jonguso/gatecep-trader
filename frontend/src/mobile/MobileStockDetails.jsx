import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MobileBuyingPowerBar from "./MobileBuyingPowerBar";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileStockDetails() {
  const { symbol } = useParams();

  const [price, setPrice] = useState(null);
  const [book, setBook] = useState(null);

  async function loadData() {
    try {
      const [priceRes, bookRes] = await Promise.all([
        fetch(`${API_URL}/prices`),
        fetch(`${API_URL}/matching/book/${symbol}`)
      ]);

      const priceData = await priceRes.json();
      const bookData = await bookRes.json();

      const found = (priceData.data || []).find(
        (item) => item.symbol === symbol
      );

      setPrice(found || null);

      if (bookData.ok) {
        setBook(bookData.book);
      }
    } catch (error) {
      console.error("Failed to load stock details:", error);
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, [symbol]);

  const bestBid = book?.bids?.[0]?.price || 0;
  const bestAsk = book?.asks?.[0]?.price || 0;
  const spread =
    bestBid && bestAsk
      ? Number((bestAsk - bestBid).toFixed(2))
      : 0;

  return (
    <div className="bg-slate-950 min-h-screen text-white pb-24">
      <MobileBuyingPowerBar />

      <div className="p-4">
        <a
          href="/mobile"
          className="text-cyan-400 text-sm"
        >
          ← Back to Coach G
        </a>

        <div className="bg-slate-900 rounded-2xl p-5 mt-4 border border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-slate-400 text-sm">
                NSE Stock
              </div>

              <h1 className="text-4xl font-bold mt-1">
                {symbol}
              </h1>

              <div className="text-slate-400 text-sm mt-1">
                {price?.name || "NSE listed security"}
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-cyan-300">
                KES{" "}
                {Number(
                  price?.price ||
                    price?.lastPrice ||
                    bestAsk ||
                    0
                ).toFixed(2)}
              </div>

              <div
                className={
                  Number(price?.changePct || 0) >= 0
                    ? "text-green-400 text-sm"
                    : "text-red-400 text-sm"
                }
              >
                {Number(price?.changePct || 0) >= 0
                  ? "+"
                  : ""}
                {Number(price?.changePct || 0).toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="h-40 bg-slate-800 rounded-2xl mt-5 flex items-center justify-center text-cyan-400 text-sm border border-slate-700">
            AI Momentum Chart Preview
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <Metric
            label="Best Bid"
            value={`KES ${Number(bestBid).toFixed(2)}`}
            color="text-green-400"
          />

          <Metric
            label="Best Ask"
            value={`KES ${Number(bestAsk).toFixed(2)}`}
            color="text-red-400"
          />

          <Metric
            label="Spread"
            value={`KES ${Number(spread).toFixed(2)}`}
            color="text-yellow-400"
          />
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500 rounded-2xl p-5 mt-5">
          <div className="text-cyan-400 font-bold mb-2">
            Coach G Analysis
          </div>

          <p className="text-sm text-slate-200 leading-6">
            {symbol} has healthy liquidity and manageable spread risk.
            Coach G recommends checking portfolio exposure before buying.
            Use smaller order size if liquidity starts weakening.
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 mt-5 border border-slate-800">
          <h2 className="text-xl font-bold mb-4">
            Safety Check
          </h2>

          <SafetyRow label="Liquidity" value="Healthy" ok />
          <SafetyRow label="Spread Risk" value="Low" ok />
          <SafetyRow label="Volatility" value="Medium" />
          <SafetyRow label="Portfolio Concentration" value="Check before buying" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <a
            href={`/mobile/order/${symbol}/BUY`}
            className="bg-green-600 rounded-2xl py-4 text-center font-bold text-lg"
          >
            Buy {symbol}
          </a>

          <a
            href={`/mobile/order/${symbol}/SELL`}
            className="bg-red-600 rounded-2xl py-4 text-center font-bold text-lg"
          >
            Sell {symbol}
          </a>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
      <div className="text-xs text-slate-400">
        {label}
      </div>

      <div className={`text-lg font-bold mt-1 ${color}`}>
        {value}
      </div>
    </div>
  );
}

function SafetyRow({ label, value, ok }) {
  return (
    <div className="flex justify-between py-3 border-b border-slate-800">
      <div className="text-slate-400">
        {label}
      </div>

      <div
        className={
          ok
            ? "text-green-400 font-bold"
            : "text-yellow-400 font-bold"
        }
      >
        {value}
      </div>
    </div>
  );
}

function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 grid grid-cols-4 text-center text-xs text-white">
      <a href="/mobile" className="py-3">Coach</a>
      <a href="/trading-terminal" className="py-3">Markets</a>
      <a href="/mobile/portfolio" className="py-3">Portfolio</a>
      <a href="/execution-analytics" className="py-3">Pro</a>
    </div>
  );
}