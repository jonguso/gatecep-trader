import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function scoreColor(score) {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-300";
  return "text-red-400";
}

function riskColor(risk) {
  if (risk === "LOW") return "text-green-400";
  if (risk === "MEDIUM") return "text-yellow-300";
  return "text-red-400";
}

export default function MobilePortfolioScore() {
  const [score, setScore] = useState(null);

  async function loadScore() {
    try {
      const res = await fetch(`${API_URL}/portfolio-score`);
      const data = await res.json();

      if (data.ok) {
        setScore(data.score);
      }
    } catch (error) {
      console.error("Failed to load portfolio score:", error);
    }
  }

  useEffect(() => {
    loadScore();

    const interval = setInterval(loadScore, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!score) {
    return (
      <div className="bg-slate-950 min-h-screen text-white p-4">
        Loading portfolio score...
      </div>
    );
  }

  const breakdown = score.scores || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold">
          Portfolio Score
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Coach G portfolio health, concentration, and diversification score.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mt-5 text-center">
          <div className="text-xs text-slate-400">
            Overall Score
          </div>

          <div className={`text-6xl font-bold mt-2 ${scoreColor(score.overallScore)}`}>
            {score.overallScore}
          </div>

          <div className="text-sm text-slate-400 mt-1">
            out of 100
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-400">
                Grade
              </div>

              <div className={`text-3xl font-bold mt-1 ${scoreColor(score.overallScore)}`}>
                {score.grade}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-3">
              <div className="text-xs text-slate-400">
                Risk Level
              </div>

              <div className={`text-2xl font-bold mt-2 ${riskColor(score.riskLevel)}`}>
                {score.riskLevel}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-4 mt-5">
          <div className="text-cyan-300 font-bold">
            Coach G Summary
          </div>

          <div className="text-sm text-slate-300 mt-2 leading-6">
            {score.coachGSummary}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mt-5">
          <div className="font-bold text-lg">
            Score Breakdown
          </div>

          <div className="space-y-4 mt-4">
            <ScoreBar label="Diversification" value={breakdown.diversificationScore} />
            <ScoreBar label="Concentration Control" value={breakdown.concentrationScore} />
            <ScoreBar label="Sector Balance" value={breakdown.sectorBalanceScore} />
            <ScoreBar label="Profitability" value={breakdown.profitabilityScore} />
            <ScoreBar label="Liquidity" value={breakdown.liquidityScore} />
            <ScoreBar label="Income Quality" value={breakdown.incomeScore} />
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 mt-5">
          <div className="text-red-300 font-bold">
            Concentration Risk
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <RiskMetric
              label="Largest Holding"
              value={score.concentration?.largestHolding}
              sub={`${score.concentration?.largestHoldingExposure}% exposure`}
            />

            <RiskMetric
              label="Largest Sector"
              value={score.concentration?.largestSector}
              sub={`${score.concentration?.largestSectorExposure}% exposure`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <a
            href="/mobile/ai-rebalance"
            className="bg-purple-500/10 border border-purple-500/40 rounded-2xl p-4 text-center font-bold text-purple-300"
          >
            AI Rebalance
          </a>

          <a
            href="/mobile/heatmap"
            className="bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-4 text-center font-bold text-cyan-300"
          >
            Heatmap
          </a>
        </div>
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}

function ScoreBar({ label, value = 0 }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-300">{label}</span>
        <span className={scoreColor(value)}>{value}/100</span>
      </div>

      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={
            value >= 80
              ? "h-2 bg-green-400 rounded-full"
              : value >= 60
              ? "h-2 bg-yellow-300 rounded-full"
              : "h-2 bg-red-400 rounded-full"
          }
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function RiskMetric({ label, value, sub }) {
  return (
    <div className="bg-slate-900/80 rounded-xl p-3">
      <div className="text-xs text-slate-400">
        {label}
      </div>

      <div className="text-xl font-bold text-red-300 mt-1">
        {value}
      </div>

      <div className="text-xs text-slate-300 mt-1">
        {sub}
      </div>
    </div>
  );
}