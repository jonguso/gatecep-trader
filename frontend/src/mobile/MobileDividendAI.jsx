import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function scoreColor(score) {
  if (score >= 85) {
    return "text-green-400";
  }

  if (score >= 70) {
    return "text-yellow-300";
  }

  return "text-red-400";
}

function riskBadge(risk) {
  if (risk === "LOW") {
    return "bg-green-500/10 text-green-400";
  }

  if (risk === "MEDIUM") {
    return "bg-yellow-500/10 text-yellow-300";
  }

  return "bg-red-500/10 text-red-400";
}

export default function MobileDividendAI() {
  const [scores, setScores] = useState([]);

  async function loadScores() {
    try {
      const res = await fetch(
        `${API_URL}/dividends/ai/scores`
      );

      const data = await res.json();

      if (data.ok) {
        setScores(data.scores || []);
      }
    } catch (error) {
      console.error(
        "Failed to load AI dividend scores:",
        error
      );
    }
  }

  useEffect(() => {
    loadScores();

    const interval = setInterval(
      loadScores,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold">
          Dividend AI
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Coach G dividend intelligence and payout analysis.
        </p>

        <div className="space-y-4 mt-5">
          {scores.map((item) => (
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
                      className={`text-[10px] px-2 py-1 rounded-full font-bold ${riskBadge(
                        item.riskLevel
                      )}`}
                    >
                      {item.riskLevel} RISK
                    </div>
                  </div>

                  <div className="text-sm text-slate-400 mt-1">
                    {item.company}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">
                    Yield
                  </div>

                  <div className="text-2xl font-bold text-cyan-300">
                    {item.estimatedYieldPercent}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-xs text-slate-400">
                    Sustainability
                  </div>

                  <div
                    className={`text-2xl font-bold mt-1 ${scoreColor(
                      item.sustainabilityScore
                    )}`}
                  >
                    {item.sustainabilityScore}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-xs text-slate-400">
                    Capture Score
                  </div>

                  <div
                    className={`text-2xl font-bold mt-1 ${scoreColor(
                      item.captureOpportunityScore
                    )}`}
                  >
                    {item.captureOpportunityScore}
                  </div>
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 mt-4">
                <div className="flex justify-between items-center">
                  <div className="text-cyan-400 font-bold">
                    Coach G Recommendation
                  </div>

                  <div className="text-xs text-cyan-300">
                    AI ANALYSIS
                  </div>
                </div>

                <div className="text-lg font-bold mt-3">
                  {item.aiRecommendation}
                </div>

                <div className="text-sm text-slate-300 mt-3 leading-6">
                  {item.symbol} currently shows an estimated dividend yield of{" "}
                  {item.estimatedYieldPercent}% with{" "}
                  {item.riskLevel.toLowerCase()} payout risk and a sustainability score of{" "}
                  {item.sustainabilityScore}.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-xs text-slate-400">
                    Books Closure
                  </div>

                  <div className="font-bold mt-1">
                    {item.booksClosureDate}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-xs text-slate-400">
                    Payment Date
                  </div>

                  <div className="font-bold mt-1">
                    {item.paymentDate}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {scores.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
              No AI dividend analysis available.
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}