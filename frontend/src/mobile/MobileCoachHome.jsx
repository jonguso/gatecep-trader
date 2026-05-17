import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import AIConfidenceRing from "../components/mobile/AIConfidenceRing";
import MobileBuyingPowerBar from "./MobileBuyingPowerBar";
import MobileBottomNav from "../components/mobile/MobileBottomNav";
import FloatingCoachG from "../components/mobile/FloatingCoachG";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function signalStyle(recommendation = "") {
  if (recommendation.includes("STRONG")) {
    return "bg-cyan-500/20 border-cyan-400 text-cyan-300";
  }

  if (recommendation.includes("BUY")) {
    return "bg-green-500/20 border-green-400 text-green-300";
  }

  if (recommendation.includes("SELL")) {
    return "bg-red-500/20 border-red-400 text-red-300";
  }

  return "bg-yellow-500/20 border-yellow-400 text-yellow-300";
}

function confidenceColor(confidence) {
  if (confidence >= 90) return "bg-cyan-400";
  if (confidence >= 75) return "bg-green-400";
  if (confidence >= 60) return "bg-yellow-400";
  return "bg-red-400";
}

function marketPrice(item) {
  const value = Number(
    item.marketPrice ||
      item.price ||
      item.lastPrice ||
      item.currentPrice ||
      0
  );

  return value.toFixed(2);
}

function aiReason(signal) {
  const recommendation = signal.recommendation || "";
  const confidence = Number(signal.confidence || 0);

  if (recommendation.includes("BUY") && confidence >= 90) {
    return "Coach G sees strong momentum, improving liquidity, and favorable execution conditions.";
  }

  if (recommendation.includes("BUY")) {
    return "Upside opportunity detected, but position sizing should remain controlled.";
  }

  if (recommendation.includes("SELL")) {
    return "Risk is elevated. Coach G detects weakening momentum or unfavorable market conditions.";
  }

  return "Hold for now. Coach G recommends waiting for a cleaner entry or stronger confirmation.";
}

function buildTradeSetup(item) {
  const price = Number(
    item.marketPrice ||
      item.price ||
      item.lastPrice ||
      item.currentPrice ||
      0
  );

  const confidence = Number(item.confidence || 0);
  const isBuy = String(item.recommendation || "").includes("BUY");

  const entry = price;
  const target = isBuy
    ? price * 1.08
    : price * 1.03;

  const stopLoss = isBuy
    ? price * 0.96
    : price * 0.98;

  const reward = Math.abs(target - entry);
  const risk = Math.abs(entry - stopLoss);

  return {
    entry,
    target,
    stopLoss,
    riskReward:
      risk > 0 ? (reward / risk).toFixed(2) : "0.00",
    positionSize:
      confidence >= 90
        ? "8% - 12%"
        : confidence >= 75
        ? "5% - 8%"
        : "2% - 5%"
  };
}

export default function MobileCoachHome() {
  const [signals, setSignals] = useState([]);
  const [dailyBriefing, setDailyBriefing] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [watchlistSymbols, setWatchlistSymbols] = useState(() => {
  const saved = localStorage.getItem(
    "gatecep_ai_watchlist"
  );


  return saved
    ? JSON.parse(saved)
    : ["SCOM", "KCB", "EQTY", "COOP"];
});

  async function loadSignals() {
    try {
      const res = await fetch(`${API_URL}/ai/signals`);
      const data = await res.json();

      if (data.ok) {
        setSignals(data.signals || []);
      }
    } catch (error) {
      console.error("Failed to load Coach G signals:", error);
    }
  }

  async function loadDailyBriefing() {
    try {
      const res = await fetch(`${API_URL}/coach/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question:
            "Give me today's NSE market briefing with risks, opportunities, and portfolio guidance."
        })
      });

      const data = await res.json();

      if (data.ok) {
        setDailyBriefing(data.answer);
      }
    } catch (error) {
      console.error("Failed to load daily briefing:", error);
    }
  }

<div className="bg-slate-900 rounded-2xl p-4 mt-5 border border-slate-800">
  <div className="flex items-center justify-between">
    <div className="font-bold text-cyan-300">
      AI Alerts
    </div>

    <div className="text-[10px] px-2 py-1 rounded-full bg-red-500/20 text-red-300">
      LIVE
    </div>
  </div>

  <div className="space-y-3 mt-4">
    {alerts.map((alert, index) => (
      <div
        key={`${alert.symbol}-${index}`}
        className="bg-slate-800 rounded-xl p-3 border border-slate-700"
      >
        <div className="flex items-center justify-between">
          <div className="font-bold">
            {alert.symbol}
          </div>

          <div
            className={
              alert.type === "HIGH_CONFIDENCE"
                ? "text-cyan-300 text-xs"
                : alert.type === "BREAKOUT"
                ? "text-green-300 text-xs"
                : "text-red-300 text-xs"
            }
          >
            {alert.type.replace("_", " ")}
          </div>
        </div>

        <div className="text-sm text-slate-300 mt-2">
          {alert.message}
        </div>
      </div>
    ))}

    {alerts.length === 0 && (
      <div className="text-sm text-slate-500">
        No active AI alerts.
      </div>
    )}
  </div>
</div>

 function toggleWatchlistSymbol(symbol) {
  setWatchlistSymbols((current) => {
    const exists = current.includes(symbol);

    const next = exists
      ? current.filter((item) => item !== symbol)
      : [...current, symbol];

    localStorage.setItem(
      "gatecep_ai_watchlist",
      JSON.stringify(next)
    );

    return next;
  });
}

useEffect(() => {
    loadSignals();
    loadDailyBriefing();

    const interval = setInterval(loadSignals, 10000);

    return () => clearInterval(interval);
  }, []);

  const topSignal = signals[0];
const customSignals = signals.filter((item) =>
  watchlistSymbols.includes(item.symbol)
);

useEffect(() => {
  const generatedAlerts = [];

  customSignals.forEach((item) => {
    const confidence = Number(item.confidence || 0);
    const changePct = Number(item.changePct || 0);

    if (confidence >= 90) {
      generatedAlerts.push({
        type: "HIGH_CONFIDENCE",
        symbol: item.symbol,
        message: `${item.symbol} AI confidence surged above 90%`
      });
    }

    if (changePct >= 5) {
      generatedAlerts.push({
        type: "BREAKOUT",
        symbol: item.symbol,
        message: `${item.symbol} is gaining strong momentum`
      });
    }

    if (
      item.recommendation?.includes("SELL")
    ) {
      generatedAlerts.push({
        type: "RISK",
        symbol: item.symbol,
        message: `${item.symbol} risk conditions worsening`
      });
    }
  });

  setAlerts(generatedAlerts.slice(0, 5));
}, [customSignals]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <MobileBuyingPowerBar />

      <div className="p-4">
        <h1 className="text-3xl font-bold">
          Coach G
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          AI-guided NSE trading assistant
        </p>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
            <div className="text-xs text-slate-400">
              Market Sentiment
            </div>

            <div className="text-lg font-bold text-green-400">
              Bullish
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
            <div className="text-xs text-slate-400">
              Top Signal
            </div>

            <div className="text-lg font-bold text-cyan-400">
              {topSignal?.symbol || "-"}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
            <div className="text-xs text-slate-400">
              AI Confidence
            </div>

            <div className="text-lg font-bold text-yellow-400">
              {topSignal?.confidence || 0}%
            </div>
          </div>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500 rounded-2xl p-4 mt-5">
          <div className="flex items-center justify-between">
            <div className="text-cyan-400 font-bold">
              Coach G Daily Briefing
            </div>

            <div className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
              LIVE AI
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-6 mt-3">
            {dailyBriefing || "Loading daily market intelligence..."}
          </p>
        </div>

<div className="bg-slate-900 rounded-2xl p-4 mt-5 border border-slate-800">
  <div className="font-bold text-cyan-300">
    Customize AI Watchlist
  </div>

  <div className="flex flex-wrap gap-2 mt-3">
    {signals.map((item) => {
      const selected = watchlistSymbols.includes(item.symbol);

      return (
        <button
          key={item.symbol}
          onClick={() => toggleWatchlistSymbol(item.symbol)}
          className={
            selected
              ? "px-3 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold"
              : "px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
          }
        >
          {item.symbol}
        </button>
      );
    })}
  </div>
</div>

        <h2 className="text-xl font-bold mt-6 mb-3">
          AI Watchlist
        </h2>

        <div className="space-y-4">
          {customSignals.slice(0, 8).map((item) => {
            const confidence = Number(item.confidence || 0);

            return (
              <div
                key={item.symbol}
                className="bg-slate-900 rounded-2xl p-4 border border-slate-800"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="text-2xl font-bold">
                      {item.symbol}
                    </div>

                    <div className="text-slate-400 text-sm">
                      AI confidence {confidence}%
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full border text-xs font-bold h-fit ${signalStyle(
                      item.recommendation
                    )}`}
                  >
                    {item.recommendation}
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-300 leading-6">
                  {aiReason(item)}
                </div>

                <div className="mt-4 flex justify-center">
                  <AIConfidenceRing
                    value={confidence}
                    size={100}
                  />
                </div>

                <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-2 rounded-full ${confidenceColor(
                      confidence
                    )}`}
                    style={{
                      width: `${confidence}%`
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-slate-800 rounded-xl p-2">
                    <div className="text-xs text-slate-400">
                      Price
                    </div>

                    <div className="font-bold text-cyan-300">
                      KES {marketPrice(item)}
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-2">
                    <div className="text-xs text-slate-400">
                      Change
                    </div>

                    <div
                      className={
                        Number(item.changePct || 0) >= 0
                          ? "font-bold text-green-400"
                          : "font-bold text-red-400"
                      }
                    >
                      {Number(item.changePct || 0) >= 0 ? "+" : ""}
                      {Number(item.changePct || 0).toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-2">
                    <div className="text-xs text-slate-400">
                      Volume
                    </div>

                    <div className="font-bold text-purple-300">
                      {Number(item.volume || 0) > 100000
                        ? "High"
                        : "Normal"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-16 bg-slate-800 rounded-xl flex items-end gap-1 px-3 py-2 border border-slate-700">
  {[35, 55, 42, 70, 58, 80, 66, 92].map((height, index) => (
    <div
      key={index}
      className={
        item.recommendation?.includes("SELL")
          ? "flex-1 rounded-t bg-red-400/70"
          : "flex-1 rounded-t bg-cyan-400/70"
      }
      style={{
        height: `${height}%`
      }}
    />
  ))}
</div>

{(() => {
  const setup = buildTradeSetup(item);

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      <div className="bg-slate-800 rounded-xl p-2">
        <div className="text-xs text-slate-400">
          Entry
        </div>
        <div className="font-bold text-cyan-300">
          KES {setup.entry.toFixed(2)}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-2">
        <div className="text-xs text-slate-400">
          Target
        </div>
        <div className="font-bold text-green-400">
          KES {setup.target.toFixed(2)}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-2">
        <div className="text-xs text-slate-400">
          Stop Loss
        </div>
        <div className="font-bold text-red-400">
          KES {setup.stopLoss.toFixed(2)}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-2">
        <div className="text-xs text-slate-400">
          Risk/Reward
        </div>
        <div className="font-bold text-yellow-300">
          {setup.riskReward}x
        </div>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-2 col-span-2">
        <div className="text-xs text-cyan-300">
          Suggested Allocation
        </div>
        <div className="font-bold text-white">
          {setup.positionSize}
        </div>
      </div>
    </div>
  );
})()}

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <a
                    href={`/mobile/stock/${item.symbol}`}
                    className="text-center bg-slate-800 rounded-xl py-3 font-bold"
                  >
                    View
                  </a>

                  <button
                    className="rounded-xl py-3 font-bold bg-slate-800 text-cyan-300"
                  >
                    🎤 Voice
                  </button>

                  <a
                    href={`/mobile/order/${item.symbol}/BUY`}
                    className="text-center bg-green-600 rounded-xl py-3 font-bold"
                  >
                    Buy
                  </a>
                </div>
              </div>
            );
          })}

          {signals.length === 0 && (
            <div className="bg-slate-900 rounded-2xl p-6 text-center text-slate-400">
              Loading AI watchlist...
            </div>
          )}
        </div>
      </div>

      <FloatingCoachG />
      <MobileBottomNav />
    </motion.div>
  );
}