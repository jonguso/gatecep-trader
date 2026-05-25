import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function sentimentColor(value) {
  if (value === "BULLISH") return "text-green-400";
  if (value === "BEARISH") return "text-red-400";
  return "text-yellow-300";
}

function riskColor(value) {
  if (value === "HIGH") return "text-red-400";
  if (value === "MEDIUM") return "text-yellow-300";
  return "text-green-400";
}

export default function MobileMarketPulse() {
  const [pulse, setPulse] = useState(null);

  async function loadPulse() {
    try {
      const res = await fetch(`${API_URL}/ai-market-pulse`);
      const data = await res.json();

      if (data.ok) {
        setPulse(data.pulse);
      }
    } catch (error) {
      console.error("Failed to load market pulse:", error);
    }
  }

  useEffect(() => {
    loadPulse();

    const interval = setInterval(loadPulse, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!pulse) {
    return (
      <div className="bg-slate-950 min-h-screen text-white p-4">
        Loading market pulse...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold">AI Market Pulse</h1>

        <p className="text-slate-400 text-sm mt-1">
          Coach G live NSE breadth, liquidity, and market sentiment.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <PulseCard
            title="Sentiment"
            value={pulse.marketSentiment}
            color={sentimentColor(pulse.marketSentiment)}
          />

          <PulseCard
            title="Risk Level"
            value={pulse.riskLevel}
            color={riskColor(pulse.riskLevel)}
          />

          <PulseCard
            title="Liquidity"
            value={`${pulse.liquidityScore}/100`}
            color="text-cyan-300"
          />

          <PulseCard
            title="Turnover"
            value={`KES ${Number(pulse.totalTurnover || 0).toLocaleString()}`}
            color="text-green-300"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mt-5">
          <div className="font-bold text-lg text-white">
            Market Breadth
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <BreadthCard label="Gainers" value={pulse.breadth.gainers} color="text-green-400" />
            <BreadthCard label="Losers" value={pulse.breadth.losers} color="text-red-400" />
            <BreadthCard label="Unchanged" value={pulse.breadth.unchanged} color="text-yellow-300" />
          </div>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-4 mt-5">
          <div className="text-cyan-300 font-bold">
            Coach G Market Summary
          </div>

<a
  href="/mobile/sector-rotation"
  className="block bg-purple-500/10 border border-purple-500/40 rounded-2xl p-4 mt-5"
>
  <div className="text-purple-300 font-bold">
    Open Sector Rotation AI
  </div>

  <div className="text-sm text-slate-300 mt-1">
    View leading, improving, weakening, and lagging NSE sectors.
  </div>
</a>

          <div className="text-sm text-slate-300 mt-2 leading-6">
            {pulse.coachGSummary}
          </div>
        </div>

        <MarketList title="Top Gainers" items={pulse.topGainers} positive />
        <MarketList title="Top Losers" items={pulse.topLosers} />
        <MarketList title="Turnover Leaders" items={pulse.turnoverLeaders} turnover />
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}

function PulseCard({ title, value, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="text-xs text-slate-400">{title}</div>
      <div className={`text-xl font-bold mt-2 ${color}`}>{value}</div>
    </div>
  );
}

function BreadthCard({ label, value, color }) {
  return (
    <div className="bg-slate-800 rounded-xl p-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function MarketList({ title, items, positive = false, turnover = false }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl mt-5 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 font-bold text-cyan-300">
        {title}
      </div>

      <div className="divide-y divide-slate-800">
        {(items || []).map((item) => (
          <a
            key={`${title}-${item.symbol}`}
            href={`/mobile/stock/${item.symbol}`}
            className="flex justify-between items-center px-4 py-4 hover:bg-slate-800/70"
          >
            <div>
              <div className="font-bold">{item.symbol}</div>
              <div className="text-xs text-slate-400">{item.name}</div>
            </div>

            <div className="text-right">
              <div className="font-bold text-cyan-300">
                KES {Number(item.price || item.lastPrice || 0).toFixed(2)}
              </div>

              <div
                className={
                  Number(item.changePct || 0) >= 0
                    ? "text-green-400 text-sm font-bold"
                    : "text-red-400 text-sm font-bold"
                }
              >
                {Number(item.changePct || 0) >= 0 ? "+" : ""}
                {Number(item.changePct || 0).toFixed(2)}%
              </div>

              {turnover && (
                <div className="text-[10px] text-slate-400">
                  Turnover KES {Number(item.turnover || 0).toLocaleString()}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}