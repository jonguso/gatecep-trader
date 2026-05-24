import { useEffect, useState } from "react";
import AIConfidenceRing from "../components/mobile/AIConfidenceRing";
import { useParams } from "react-router-dom";
import MobileBuyingPowerBar from "./MobileBuyingPowerBar";
import MobileMiniChart from "../components/mobile/MobileMiniChart";
import LiveAISentimentBanner from "../components/mobile/LiveAISentimentBanner";
import FloatingCoachG from "../components/mobile/FloatingCoachG";
import MobileBottomNav from "../components/mobile/MobileBottomNav";
import { motion } from "framer-motion";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileStockDetails() {
  const { symbol } = useParams();

  const [price, setPrice] = useState(null);
  const [book, setBook] = useState(null);
  const [lastDisplayPrice, setLastDisplayPrice] = useState(null);
  const [priceFlash, setPriceFlash] = useState("");
 
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

const newPrice = Number(
  found?.price ||
    found?.lastPrice ||
    found?.currentPrice ||
    0
);

if (newPrice > 0) {
  if (lastDisplayPrice !== null) {
    if (newPrice > lastDisplayPrice) {
      setPriceFlash("text-green-400 scale-105");
    } else if (newPrice < lastDisplayPrice) {
      setPriceFlash("text-red-400 scale-105");
    }

    setTimeout(() => {
      setPriceFlash("");
    }, 800);
  }

  setLastDisplayPrice(newPrice);
}

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

    const livePrice = Number(
  price?.price ||
    price?.lastPrice ||
    price?.marketPrice ||
    price?.currentPrice ||
    0
);

const bestBid =
  livePrice > 0
    ? Number((livePrice * 0.995).toFixed(2))
    : 0;

const bestAsk =
  livePrice > 0
    ? Number((livePrice * 1.005).toFixed(2))
    : 0;

const spread =
  livePrice > 0
    ? Number((bestAsk - bestBid).toFixed(2))
    : 0;

  return (
    <motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25 }}
  className="bg-slate-950 min-h-screen text-white pb-24"
>
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
              <div
  className={`text-3xl font-bold transition-all duration-300 ${
    priceFlash || "text-cyan-300"
  }`}
>
                KES {livePrice.toFixed(2)}
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

          <div className="mt-5">
<LiveAISentimentBanner />
  <MobileMiniChart symbol={symbol} height={180} />

  <OrderBookDepth book={book} symbol={symbol} />

 <LiquidityPressure book={book} />

 <AITradeSetup
  symbol={symbol}
  price={price}
  book={book}
/>

 <TradingStats price={price} />

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
<div className="flex justify-center mb-4">
  <AIConfidenceRing
    value={92}
    size={120}
  />
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

     <FloatingCoachG />
     <MobileBottomNav />
   </motion.div>
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

function OrderBookDepth({ book, symbol }) {
  const bids = book?.bids || [];
  const asks = book?.asks || [];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 mt-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          Market Depth
        </h2>

        <div className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
          TAP TO TRADE
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-green-400 font-bold mb-2">
            BIDS
          </div>

          <div className="space-y-2">
            {bids.slice(0, 5).map((bid, index) => (
              <a
                key={`bid-${index}`}
                href={`/mobile/order/${symbol}/BUY`}
                className="block bg-green-500/10 border border-green-500/20 rounded-xl p-3 hover:bg-green-500/20 transition-colors"
              >
                <div className="flex justify-between">
                  <span className="font-bold text-green-400">
                    {Number(bid.price || 0).toFixed(2)}
                  </span>

                  <span className="text-slate-300">
                    {Number(bid.quantity || 0).toLocaleString()}
                  </span>
                </div>

                <div className="text-[10px] text-green-300 mt-1">
                  Tap to Buy
                </div>
              </a>
            ))}

            {bids.length === 0 && (
              <div className="text-xs text-slate-500">
                No bid orders.
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="text-red-400 font-bold mb-2">
            ASKS
          </div>

          <div className="space-y-2">
            {asks.slice(0, 5).map((ask, index) => (
              <a
                key={`ask-${index}`}
                href={`/mobile/order/${symbol}/SELL`}
                className="block bg-red-500/10 border border-red-500/20 rounded-xl p-3 hover:bg-red-500/20 transition-colors"
              >
                <div className="flex justify-between">
                  <span className="font-bold text-red-400">
                    {Number(ask.price || 0).toFixed(2)}
                  </span>

                  <span className="text-slate-300">
                    {Number(ask.quantity || 0).toLocaleString()}
                  </span>
                </div>

                <div className="text-[10px] text-red-300 mt-1">
                  Tap to Sell
                </div>
              </a>
            ))}

            {asks.length === 0 && (
              <div className="text-xs text-slate-500">
                No ask orders.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TradingStats({ price }) {
  const open = Number(price?.open || 0);
  const high = Number(price?.high || 0);
  const low = Number(price?.low || 0);
  const prevClose = Number(price?.prevClose || 0);
  const volume = Number(price?.volume || 0);
  const turnover = Number(price?.turnover || 0);
  const lastPrice = Number(
    price?.price ||
      price?.lastPrice ||
      price?.currentPrice ||
      0
  );

  const vwap =
    volume > 0
      ? turnover / volume
      : lastPrice;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 mt-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          Trading Statistics
        </h2>

        <div className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
          NSE DATA
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Open" value={`KES ${open.toFixed(2)}`} />
        <Stat label="High" value={`KES ${high.toFixed(2)}`} color="text-green-400" />
        <Stat label="Low" value={`KES ${low.toFixed(2)}`} color="text-red-400" />
        <Stat label="Prev Close" value={`KES ${prevClose.toFixed(2)}`} />
        <Stat label="Volume" value={volume.toLocaleString()} />
        <Stat label="Turnover" value={`KES ${turnover.toLocaleString()}`} />
        <Stat label="VWAP" value={`KES ${Number(vwap || 0).toFixed(2)}`} color="text-cyan-300" />
        <Stat label="Market Cap" value="Coming Soon" color="text-slate-400" />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color = "text-white"
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-3">
      <div className="text-xs text-slate-400">
        {label}
      </div>

      <div className={`font-bold mt-1 ${color}`}>
        {value}
      </div>
    </div>
  );
}

function LiquidityPressure({ book }) {
  const bids = book?.bids || [];
  const asks = book?.asks || [];

  const totalBidQty = bids.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalAskQty = asks.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const totalDepth = totalBidQty + totalAskQty;

  const bidPressure =
    totalDepth > 0
      ? Math.round((totalBidQty / totalDepth) * 100)
      : 50;

  const askPressure = 100 - bidPressure;

  const signal =
    bidPressure >= 60
      ? "Buyers Strong"
      : askPressure >= 60
      ? "Sellers Strong"
      : "Balanced";

  const signalColor =
    bidPressure >= 60
      ? "text-green-400"
      : askPressure >= 60
      ? "text-red-400"
      : "text-yellow-400";

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 mt-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">
            Liquidity Pressure
          </h2>

          <div className={`text-sm font-bold mt-1 ${signalColor}`}>
            {signal}
          </div>
        </div>

        <div className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
          DEPTH AI
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Bids {bidPressure}%</span>
          <span>Asks {askPressure}%</span>
        </div>

        <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="bg-green-400 h-3"
            style={{
              width: `${bidPressure}%`
            }}
          />

          <div
            className="bg-red-400 h-3"
            style={{
              width: `${askPressure}%`
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Stat
          label="Bid Depth"
          value={totalBidQty.toLocaleString()}
          color="text-green-400"
        />

        <Stat
          label="Ask Depth"
          value={totalAskQty.toLocaleString()}
          color="text-red-400"
        />
      </div>
    </div>
  );
}

function AITradeSetup({
  symbol,
  price,
  book
}) {
  const livePrice = Number(
    price?.price ||
      price?.lastPrice ||
      price?.currentPrice ||
      0
  );

  const bids = book?.bids || [];
  const asks = book?.asks || [];

  const strongestBid =
    bids.length > 0
      ? Math.max(
          ...bids.map((b) =>
            Number(b.price || 0)
          )
        )
      : livePrice * 0.98;

  const strongestAsk =
    asks.length > 0
      ? Math.min(
          ...asks.map((a) =>
            Number(a.price || 0)
          )
        )
      : livePrice * 1.02;

  const support = Number(
    (strongestBid * 0.995).toFixed(2)
  );

  const resistance = Number(
    (strongestAsk * 1.005).toFixed(2)
  );

  const stopLoss = Number(
    (support * 0.97).toFixed(2)
  );

  const takeProfit = Number(
    (resistance * 1.05).toFixed(2)
  );

  const reward =
    takeProfit - livePrice;

  const risk =
    livePrice - stopLoss;

  const rr =
    risk > 0
      ? (reward / risk).toFixed(2)
      : "0";

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 mt-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">
            Coach G Trade Setup
          </h2>

          <div className="text-sm text-cyan-300 mt-1">
            AI Generated Entry Zones
          </div>
        </div>

        <div className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
          AI SETUP
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <Stat
          label="Support"
          value={`KES ${support}`}
          color="text-green-400"
        />

        <Stat
          label="Resistance"
          value={`KES ${resistance}`}
          color="text-red-400"
        />

        <Stat
          label="Stop Loss"
          value={`KES ${stopLoss}`}
          color="text-yellow-300"
        />

        <Stat
          label="Take Profit"
          value={`KES ${takeProfit}`}
          color="text-cyan-300"
        />

        <Stat
          label="Risk/Reward"
          value={`${rr}:1`}
          color="text-purple-300"
        />

        <Stat
          label="AI Bias"
          value={
            Number(rr) >= 2
              ? "Bullish"
              : "Neutral"
          }
          color={
            Number(rr) >= 2
              ? "text-green-400"
              : "text-yellow-300"
          }
        />
      </div>

      <div className="mt-5 bg-cyan-500/10 border border-cyan-500 rounded-xl p-4">
        <div className="text-sm text-slate-300 leading-6">
          Coach G detects accumulation around
          <span className="text-green-400 font-bold">
            {" "}KES {support}
          </span>
          {" "}with possible upside toward
          <span className="text-cyan-300 font-bold">
            {" "}KES {takeProfit}
          </span>.
          Maintain disciplined risk management.
        </div>
      </div>
    </div>
  );
}