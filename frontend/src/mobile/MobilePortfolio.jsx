import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";
import MobilePortfolioDashboard from "./MobilePortfolioDashboard";
import usePortfolioSocket from "../hooks/usePortfolioSocket";

export default function MobilePortfolio() {
  const {
    portfolio: livePortfolio,
    connected
  } = usePortfolioSocket();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-2">
          My Portfolio
        </h1>

        <div className="mb-5 text-xs">
          <span
            className={
              connected
                ? "text-green-400"
                : "text-yellow-400"
            }
          >
            {connected
              ? "● Live portfolio stream connected"
              : "● Using fallback portfolio refresh"}
          </span>
        </div>

<a
  href="/mobile/heatmap"
  className="block bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-4 mb-5"
>
  <div className="text-cyan-300 font-bold">
    Open Portfolio Heatmap
  </div>

  <div className="text-sm text-slate-300 mt-1">
    View live exposure, sector concentration, and portfolio risk visualization.
  </div>
</a>

<a
  href="/mobile/ai-rebalance"
  className="block bg-purple-500/10 border border-purple-500/40 rounded-2xl p-4 mb-5"
>
  <div className="text-purple-300 font-bold">
    Open AI Rebalance
  </div>

  <div className="text-sm text-slate-300 mt-1">
    View Coach G portfolio exposure, concentration risk, and rebalance suggestions.
  </div>
</a>

<a
  href="/mobile/portfolio-score"
  className="block bg-green-500/10 border border-green-500/40 rounded-2xl p-4 mb-5"
>
  <div className="text-green-300 font-bold">
    Open Portfolio Score
  </div>

  <div className="text-sm text-slate-300 mt-1">
    View Coach G portfolio grade, concentration risk, and score breakdown.
  </div>
</a>

<a
  href="/mobile/trade-journal"
  className="block bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-4 mb-5"
>
  <div className="text-cyan-300 font-bold">
    Open AI Trade Journal
  </div>

  <div className="text-sm text-slate-300 mt-1">
    Review trade grades, behavior patterns, and Coach G execution feedback.
  </div>
</a>

<a
  href="/mobile/funds"
  className="block bg-yellow-500/10 border border-yellow-500/40 rounded-2xl p-4 mb-5"
>
  <div className="text-yellow-300 font-bold">
    Open Funds & Buying Power
  </div>

  <div className="text-sm text-slate-300 mt-1">
    View available funds, ledger balance, pending orders, and settlement balances.
  </div>
</a>

        <MobilePortfolioDashboard
          livePortfolio={livePortfolio}
        />
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}