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


        <MobilePortfolioDashboard
          livePortfolio={livePortfolio}
        />
<div className="grid grid-cols-2 gap-3 mt-5">
  <ActionTile
    href="/mobile/portfolio-heatmap"
    title="Portfolio Heatmap"
    color="cyan"
  />

  <ActionTile
    href="/mobile/ai-rebalance"
    title="AI Rebalance"
    color="purple"
  />

  <ActionTile
    href="/mobile/portfolio-score"
    title="Portfolio Score"
    color="green"
  />

  <ActionTile
    href="/mobile/trade-journal"
    title="AI Trade Journal"
    color="blue"
  />

  <ActionTile
    href="/mobile/funds"
    title="Fund & Buying Power"
    color="yellow"
  />

  <ActionTile
    href="/mobile/broker-treasury"
    title="Broker Buying Power"
    color="pink"
  />
</div>

</div>    
      <MobileBottomNav />
    </motion.div>
  );
}

function ActionTile({ href, title, color = "cyan" }) {
  const styles = {
    cyan: "bg-cyan-500/10 border-cyan-500/40 text-cyan-300",
    purple: "bg-purple-500/10 border-purple-500/40 text-purple-300",
    green: "bg-green-500/10 border-green-500/40 text-green-300",
    blue: "bg-blue-500/10 border-blue-500/40 text-blue-300",
    yellow: "bg-yellow-500/10 border-yellow-500/40 text-yellow-300",
    pink: "bg-pink-500/10 border-pink-500/40 text-pink-300"
  };

  return (
    <a
      href={href}
      className={`rounded-2xl border p-4 text-center font-bold ${styles[color]}`}
    >
      {title}
    </a>
  );
}