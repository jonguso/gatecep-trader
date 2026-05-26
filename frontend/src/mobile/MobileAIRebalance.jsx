import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function actionColor(action) {
  if (action === "REDUCE") {
    return "bg-red-500/20 text-red-400";
  }

  if (action === "TRIM") {
    return "bg-yellow-500/20 text-yellow-300";
  }

  if (action === "REVIEW") {
    return "bg-orange-500/20 text-orange-300";
  }

  if (action === "ADD_SELECTIVELY") {
    return "bg-cyan-500/20 text-cyan-300";
  }

  return "bg-green-500/20 text-green-300";
}

function priorityColor(priority) {
  if (priority === "HIGH") {
    return "text-red-400";
  }

  if (priority === "MEDIUM") {
    return "text-yellow-300";
  }

  return "text-green-400";
}

export default function MobileAIRebalance() {
  const [analysis, setAnalysis] = useState(null);

  async function loadAnalysis() {
    try {
      const res = await fetch(
        `${API_URL}/ai-rebalance`
      );

      const data = await res.json();

      if (data.ok) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error(
        "Failed to load AI rebalance:",
        error
      );
    }
  }

  useEffect(() => {
    loadAnalysis();

    const interval = setInterval(
      loadAnalysis,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  const suggestions =
    analysis?.suggestions || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <div className="p-4">
       <div className="flex justify-between items-start mb-4">
  <div>
    <h1 className="text-3xl font-bold">
      AI Rebalance
    </h1>

    <div className="text-slate-400 text-sm mt-2">
      Coach G portfolio diversification and exposure analysis.
    </div>
  </div>

  <a
    href="/mobile/portfolio"
    className="bg-slate-800 hover:bg-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-cyan-300"
  >
    ✕ Close
  </a>
</div>

        <div className="bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-4 mt-5">
          <div className="text-xs text-slate-400">
            Portfolio Risk Level
          </div>

          <div
            className={`text-3xl font-bold mt-1 ${priorityColor(
              analysis?.riskLevel || "LOW"
            )}`}
          >
            {analysis?.riskLevel || "LOW"}
          </div>

          <div className="text-sm text-slate-300 mt-3">
            Total Portfolio Value:
          </div>

          <div className="text-xl font-bold text-cyan-300 mt-1">
            KES{" "}
            {Number(
              analysis?.totalValue || 0
            ).toLocaleString()}
          </div>
        </div>

        <div className="space-y-4 mt-5">
          {suggestions.map((item) => (
            <div
              key={item.symbol}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">
                      {item.symbol}
                    </div>

                    <div
                      className={`text-[10px] px-2 py-1 rounded-full font-bold ${actionColor(
                        item.action
                      )}`}
                    >
                      {item.action}
                    </div>
                  </div>

                  <div className="text-sm text-slate-400 mt-1">
                    {item.sector}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">
                    Exposure
                  </div>

                  <div className="text-2xl font-bold text-cyan-300">
                    {item.exposure}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-xs text-slate-400">
                    Market Value
                  </div>

                  <div className="font-bold mt-1">
                    KES{" "}
                    {Number(
                      item.marketValue || 0
                    ).toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-xs text-slate-400">
                    Unrealized P&L
                  </div>

                  <div
                    className={
                      Number(item.unrealizedPnL || 0) >= 0
                        ? "font-bold text-green-300 mt-1"
                        : "font-bold text-red-300 mt-1"
                    }
                  >
                    {Number(item.unrealizedPnL || 0) >= 0
                      ? "+"
                      : ""}
                    KES{" "}
                    {Math.round(
                      item.unrealizedPnL || 0
                    ).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-3 mt-4">
                <div className="text-xs text-slate-400">
                  Brokers
                </div>

                <div className="font-bold mt-1 text-cyan-300">
                  {(item.brokers || []).join(", ")}
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 mt-4">
                <div className="flex justify-between items-center">
                  <div className="text-cyan-400 font-bold">
                    Coach G Recommendation
                  </div>

                  <div
                    className={`text-xs font-bold ${priorityColor(
                      item.priority
                    )}`}
                  >
                    {item.priority} PRIORITY
                  </div>
                </div>

                <div className="text-sm text-slate-300 mt-3 leading-6">
                  {item.recommendation}
                </div>
              </div>
            </div>
          ))}

          {suggestions.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
              No rebalance recommendations available.
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}