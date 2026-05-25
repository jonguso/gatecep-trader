import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function tileColor(pnl) {
  if (pnl >= 50000) {
    return "bg-green-500/30 border-green-400";
  }

  if (pnl >= 0) {
    return "bg-green-500/15 border-green-500/40";
  }

  return "bg-red-500/20 border-red-500/50";
}

function groupBySector(holdings = []) {
  const map = new Map();

  for (const item of holdings) {
    const sector = item.sector || "Unknown";

    if (!map.has(sector)) {
      map.set(sector, {
        sector,
        holdings: [],
        marketValue: 0,
        unrealizedPnL: 0
      });
    }

    const current = map.get(sector);

    current.holdings.push(item);
    current.marketValue += Number(item.marketValue || 0);
    current.unrealizedPnL += Number(item.unrealizedPnL || 0);
  }

  return Array.from(map.values()).sort(
    (a, b) => b.marketValue - a.marketValue
  );
}

export default function MobilePortfolioHeatmap() {
  const [portfolio, setPortfolio] = useState(null);

  async function loadPortfolio() {
    try {
      const res = await fetch(`${API_URL}/portfolio/unified`);
      const data = await res.json();

      if (data.ok) {
        setPortfolio(data.portfolio);
      }
    } catch (error) {
      console.error("Failed to load heatmap:", error);
    }
  }

  useEffect(() => {
    loadPortfolio();

    const interval = setInterval(loadPortfolio, 10000);

    return () => clearInterval(interval);
  }, []);

  const groupedSectors = groupBySector(
    portfolio?.holdings || []
  );

  const totalValue = Number(portfolio?.totalMarketValue || 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold">
          Portfolio Heatmap
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Live exposure, profit/loss, and concentration view.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          {groupedSectors.map((sectorGroup) => {
            const pnl = Number(sectorGroup.unrealizedPnL || 0);
            const value = Number(sectorGroup.marketValue || 0);

            const exposure =
              totalValue > 0
                ? Math.round((value / totalValue) * 100)
                : 0;

            return (
              <div
                key={sectorGroup.sector}
                className={`rounded-2xl border p-4 min-h-[180px] ${tileColor(
                  pnl
                )}`}
              >
                <div className="flex items-center justify-between gap-3">
  <div>
    <div className="text-xl font-bold">
      {sectorGroup.sector}
    </div>

    <div className="text-xs text-slate-300 mt-1">
      {sectorGroup.holdings.length} securities
    </div>
  </div>

  <div className="flex items-center gap-4 text-right">
    <div>
      <div className="text-[10px] text-slate-400">
        Exposure
      </div>

      <div className="text-sm font-bold text-cyan-300">
        {exposure}%
      </div>
    </div>

    <div>
      <div className="text-[10px] text-slate-400">
        Value
      </div>

      <div className="text-sm font-bold">
        KES {value.toLocaleString()}
      </div>
    </div>

    <div>
      <div className="text-[10px] text-slate-400">
        P&L
      </div>

      <div
        className={
          pnl >= 0
            ? "text-sm font-bold text-green-300"
            : "text-sm font-bold text-red-300"
        }
      >
        {pnl >= 0 ? "+" : ""}
        KES {Math.round(pnl).toLocaleString()}
      </div>
    </div>
  </div>
</div>

                <div className="space-y-2 mt-4">
                  {sectorGroup.holdings.map((holding) => (
                    <a
                      key={`${holding.broker}-${holding.symbol}`}
                      href={`/mobile/stock/${String(
                        holding.symbol
                      ).trim()}`}
                      className="block bg-slate-950/40 rounded-xl p-3 hover:bg-slate-800/70"
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="font-bold">
                            {String(holding.symbol).trim()}
                          </div>

                          <div className="text-[10px] text-slate-400">
                            {holding.broker}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-cyan-300 text-sm font-bold">
                            KES{" "}
                            {Number(
                              holding.marketValue || 0
                            ).toLocaleString()}
                          </div>

                          <div
                            className={
                              Number(holding.unrealizedPnL || 0) >= 0
                                ? "text-green-300 text-xs"
                                : "text-red-300 text-xs"
                            }
                          >
                            {Number(holding.unrealizedPnL || 0) >= 0
                              ? "+"
                              : ""}
                            KES{" "}
                            {Math.round(
                              holding.unrealizedPnL || 0
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}

          {groupedSectors.length === 0 && (
            <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
              No holdings available.
            </div>
          )}
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-4 mt-5">
  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
    <div>
      <div className="text-cyan-300 font-bold">
        Coach G Heatmap Insight
      </div>

      <div className="text-sm text-slate-300 mt-2 leading-6">
        Heatmap groups holdings by sector. Larger exposure groups need closer risk review, while green groups show profitable areas of the portfolio.
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3">
      <MiniSummary
        label="Total Portfolio"
        value={`KES ${Number(
          portfolio?.totalMarketValue || 0
        ).toLocaleString()}`}
        color="text-cyan-300"
      />

      <MiniSummary
        label="Total P&L"
        value={`${
          Number(portfolio?.totalUnrealizedPnL || 0) >= 0
            ? "+"
            : ""
        }KES ${Math.round(
          portfolio?.totalUnrealizedPnL || 0
        ).toLocaleString()}`}
        color={
          Number(portfolio?.totalUnrealizedPnL || 0) >= 0
            ? "text-green-300"
            : "text-red-300"
        }
      />

      <MiniSummary
        label="Total Return"
        value={`${Number(
          portfolio?.totalMarketValue || 0
        ) > 0
          ? (
              (Number(portfolio?.totalUnrealizedPnL || 0) /
                (Number(portfolio?.totalMarketValue || 0) -
                  Number(portfolio?.totalUnrealizedPnL || 0))) *
              100
            ).toFixed(2)
          : "0.00"}%`}
        color="text-green-300"
      />
    </div>
  </div>

  <div className="text-center text-xs text-slate-400 mt-5">
    Percentages represent share of total portfolio market value.
  </div>
</div>
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}

function MiniSummary({ label, value, color }) {
  return (
    <div className="bg-slate-800/80 rounded-xl px-4 py-3 min-w-[140px]">
      <div className="text-[10px] text-slate-400">
        {label}
      </div>

      <div className={`font-bold mt-1 ${color}`}>
        {value}
      </div>
    </div>
  );
}