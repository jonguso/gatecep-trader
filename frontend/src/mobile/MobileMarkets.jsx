import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function formatMoney(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

function changeColor(value) {
  return Number(value || 0) >= 0
    ? "text-green-400"
    : "text-red-400";
}

export default function MobileMarkets() {
  const [prices, setPrices] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");

<a
  href="/mobile/market-pulse"
  className="block bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-4 mt-5"
>
  <div className="text-cyan-300 font-bold">
    Open AI Market Pulse
  </div>

  <div className="text-sm text-slate-300 mt-1">
    View NSE breadth, liquidity, gainers, losers, turnover leaders, and Coach G market sentiment.
  </div>
</a>

  async function loadPrices() {
    try {
      const res = await fetch(`${API_URL}/prices`);
      const data = await res.json();

      setPrices(data.data || []);
    } catch (error) {
      console.error("Failed to load prices:", error);
    }
  }

  useEffect(() => {
    loadPrices();

    const interval = setInterval(loadPrices, 5000);

    return () => clearInterval(interval);
  }, []);

  const gainers = useMemo(() => {
    return [...prices]
      .sort((a, b) => Number(b.changePct || 0) - Number(a.changePct || 0))
      .slice(0, 5);
  }, [prices]);

  const losers = useMemo(() => {
    return [...prices]
      .sort((a, b) => Number(a.changePct || 0) - Number(b.changePct || 0))
      .slice(0, 5);
  }, [prices]);

  const active = useMemo(() => {
    return [...prices]
      .sort((a, b) => Number(b.turnover || 0) - Number(a.turnover || 0))
      .slice(0, 5);
  }, [prices]);

const allSecurities = useMemo(() => {
  return [...prices].sort((a, b) =>
    String(a.symbol).localeCompare(String(b.symbol))
  );
}, [prices]);

const visibleItems =
  activeTab === "GAINERS"
    ? gainers
    : activeTab === "LOSERS"
    ? losers
    : activeTab === "ACTIVE"
    ? active
    : allSecurities;

const sectionTitle =
  activeTab === "GAINERS"
    ? "Top Gainers"
    : activeTab === "LOSERS"
    ? "Top Losers"
    : activeTab === "ACTIVE"
    ? "Most Active"
    : "NSE Securities";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold">
          Markets
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Live market movers, liquidity, and trading opportunities.
        </p>

        <div className="flex gap-2 mt-5 overflow-x-auto pb-2">
  {[
    ["ALL", "NSE Securities"],
    ["GAINERS", "Top Gainers"],
    ["LOSERS", "Top Losers"],
    ["ACTIVE", "Most Active"]
  ].map(([key, label]) => (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      className={
        activeTab === key
          ? "whitespace-nowrap bg-cyan-500 text-slate-950 px-4 py-2 rounded-xl text-sm font-bold"
          : "whitespace-nowrap bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold"
      }
    >
      {label}
    </button>
  ))}
</div>

        <MarketSection
          title={sectionTitle}
          items={visibleItems}
          badge={
            activeTab === "GAINERS"
              ? "GAINER"
              : activeTab === "LOSERS"
              ? "LOSER"
              : activeTab === "ACTIVE"
              ? "ACTIVE"
              : "NSE"
          }
        />
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}

function MarketSection({
  title,
  items,
  badge,
  
}) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 mt-5 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 flex justify-between items-center">
        <h2 className="font-bold text-lg text-cyan-300">
          {title}
        </h2>

        <span className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/40">
          LIVE
        </span>
      </div>

      <div className="divide-y divide-slate-800">
        {items.map((item, index) => {
          const pct = Number(item.changePct || 0);
          const positive = pct >= 0;

          return (
            <a
              key={`${title}-${item.symbol}`}
              href={`/mobile/stock/${item.symbol}`}
              className="grid grid-cols-[32px_1fr_auto] gap-3 px-4 py-4 hover:bg-slate-800/70 transition-colors"
            >
              <div className="text-slate-500 font-bold">
                {index + 1}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">
                    {item.symbol}
                  </span>

                  <span
                    className={
                      positive
                        ? "text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400"
                        : "text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400"
                    }
                  >
                    {badge}
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  {item.name || "NSE listed security"}
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800 rounded-lg px-2 py-1">
                    Vol: {Number(item.volume || 0).toLocaleString()}
                  </div>

                  <div className="bg-slate-800 rounded-lg px-2 py-1">
                    Turnover: {formatMoney(item.turnover)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-cyan-300">
                  {formatMoney(item.price || item.lastPrice)}
                </div>

                <div className={`text-sm font-bold ${changeColor(pct)}`}>
                  {positive ? "+" : ""}
                  {pct.toFixed(2)}%
                </div>

               <div className="mt-2 h-8 w-24 rounded-lg bg-slate-800 overflow-hidden flex items-end gap-1 px-2 py-1">
  {[35, 60, 45, 75, 55, 85].map((height, i) => (
    <div
      key={i}
      className={
        positive
          ? "w-2 rounded-t bg-green-400/70"
          : "w-2 rounded-t bg-red-400/70"
      }
      style={{
        height: `${height}%`
      }}
    />
  ))}
</div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}