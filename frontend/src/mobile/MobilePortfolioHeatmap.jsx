import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

const manualSectorFix = {
  EQTY: "Banking",
  SCOM: "Telecom",
  KCB: "Banking",
  BAT: "Commercial"
};


function shortSectorName(name) {
  const map = {
    Telecommunications: "Telecom",
    Telecommunication: "Telecom",
    "Manufacturing and Allied": "Commercial",
    Industrials: "Commercial",
    Industrial: "Commercial",
    Manufacturing: "Commercial",
    "Consumer Goods": "Commercial",
    InvestmentServices: "Investment",
    "Investment Services": "Investment",
    Unknown: "Commercial"
  };

  return map[name] || name || "Commercial";
}

function sectorIcon(sector) {
  const icons = {
    Telecom: "📡",
    Banking: "🏦",
    Commercial: "🏢",
    Insurance: "🛡️",
    Energy: "⚡",
    Investment: "📊"
  };

  return icons[sector] || "◆";
}

function tileColor(pnl) {
  if (pnl >= 50000) return "bg-green-500/30 border-green-400";
  if (pnl >= 0) return "bg-green-500/15 border-green-500/40";
  return "bg-red-500/20 border-red-500/50";
}

function getHoldingAction(holding, sectorExposure = 0) {
  const pnl = Number(holding.unrealizedPnL || 0);
  const marketValue = Number(holding.marketValue || 0);
  const avgCost = Number(holding.averageCost || 0);
  const currentPrice = Number(holding.currentPrice || 0);

  const gainPct =
    avgCost > 0 && currentPrice > 0
      ? ((currentPrice - avgCost) / avgCost) * 100
      : marketValue > 0
      ? (pnl / marketValue) * 100
      : 0;

  if (sectorExposure >= 60 && gainPct > 15) {
    return {
      label: "TAKE PROFIT",
      className: "bg-green-500/20 text-green-300 border-green-500/40"
    };
  }

  if (sectorExposure >= 40) {
    return {
      label: "REDUCE",
      className: "bg-red-500/20 text-red-300 border-red-500/40"
    };
  }

  if (gainPct <= -10) {
    return {
      label: "REVIEW",
      className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
    };
  }

  if (gainPct >= 10) {
    return {
      label: "HOLD",
      className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
    };
  }

  return {
    label: "ACCUMULATE",
    className: "bg-purple-500/20 text-purple-300 border-purple-500/40"
  };
}

function enrichHolding(holding, sectorLookup, priceLookup) {
  const symbol = String(holding.symbol || "").trim();

  const currentPrice = Number(
    holding.currentPrice ||
      holding.price ||
      holding.lastPrice ||
      priceLookup[symbol] ||
      0
  );

  const quantity = Number(
    holding.quantity ||
      holding.qty ||
      holding.shares ||
      0
  );

  const averageCost = Number(
    holding.averageCost ||
      holding.avgCost ||
      holding.costBasis ||
      0
  );

  const marketValue =
    currentPrice > 0
      ? quantity * currentPrice
      : Number(holding.marketValue || 0);

  const unrealizedPnL =
    averageCost > 0 && currentPrice > 0
      ? (currentPrice - averageCost) * quantity
      : Number(holding.unrealizedPnL || 0);

  return {
    ...holding,
    symbol,
    quantity,
    averageCost,
    currentPrice,
    marketValue,
    unrealizedPnL,
    sector: shortSectorName(
      manualSectorFix[symbol] ||
        holding.sector ||
        sectorLookup[symbol] ||
        "Commercial"
    )
  };
}

function groupBySector(holdings = [], sectorLookup = {}, priceLookup = {}) {
  const map = new Map();

  for (const rawHolding of holdings) {
    const item = enrichHolding(rawHolding, sectorLookup, priceLookup);
    const sector = item.sector;

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
  const [marketRows, setMarketRows] = useState([]);
  const [simulation, setSimulation] = useState(null);
  const [rebalancePercent, setRebalancePercent] = useState(15);
  const [rebalanceOrders, setRebalanceOrders] = useState({
    sellOrders: [],
    buyOrders: [],
    projectedExposure: 0
  });
  const [showExecutionReview, setShowExecutionReview] =
  useState(false);
  const [executingRebalance, setExecutingRebalance] =
  useState(false);

const [rebalanceResult, setRebalanceResult] =
  useState(null);


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

  async function loadMarketRows() {
    try {
      const res = await fetch(`${API_URL}/prices`);
      const data = await res.json();

      setMarketRows(data.data || []);
    } catch (error) {
      console.error("Failed to load market sectors:", error);
    }
  }

  useEffect(() => {
    loadPortfolio();
    loadMarketRows();

    const interval = setInterval(() => {
      loadPortfolio();
      loadMarketRows();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const sectorLookup = Object.fromEntries(
    marketRows.map((item) => [
      String(item.symbol || "").trim(),
      item.sector || "Commercial"
    ])
  );

  const priceLookup = Object.fromEntries(
    marketRows.map((item) => [
      String(item.symbol || "").trim(),
      Number(item.price || item.lastPrice || 0)
    ])
  );

  const groupedSectors = groupBySector(
    portfolio?.holdings || [],
    sectorLookup,
    priceLookup
  );

  const totalValue = groupedSectors.reduce(
    (sum, item) => sum + Number(item.marketValue || 0),
    0
  );

  const totalPnL = groupedSectors.reduce(
    (sum, item) => sum + Number(item.unrealizedPnL || 0),
    0
  );

  const topSector =
    groupedSectors.length > 0 ? groupedSectors[0] : null;

  const topExposure =
    totalValue > 0 && topSector
      ? Math.round((topSector.marketValue / totalValue) * 100)
      : 0;

  const diversificationScore =
    groupedSectors.length >= 5
      ? "Excellent"
      : groupedSectors.length >= 3
      ? "Moderate"
      : "Concentrated";

  const portfolioRisk =
    topExposure >= 60
      ? "High Risk"
      : topExposure >= 40
      ? "Moderate Risk"
      : "Balanced";

  function generateRebalanceOrders(reducePercent, projectedExposure) {
    if (!topSector) return;

    const sellOrders = topSector.holdings
      .map((holding) => {
        const currentPrice = Number(holding.currentPrice || 0);
        const quantity = Number(holding.quantity || 0);

        const qtyToSell = Math.max(
          0,
          Math.floor(quantity * (reducePercent / 100))
        );

        return {
          symbol: holding.symbol,
          broker: holding.broker,
          side: "SELL",
          quantity: qtyToSell,
          price: currentPrice,
          estimatedValue: qtyToSell * currentPrice
        };
      })
      .filter((order) => order.quantity > 0);

    const buyOrders = [
      {
        symbol: "EQTY",
        sector: "Banking",
        side: "BUY",
        allocation: "50%"
      },
      {
        symbol: "BAT",
        sector: "Commercial",
        side: "BUY",
        allocation: "30%"
      },
      {
        symbol: "KCB",
        sector: "Banking",
        side: "BUY",
        allocation: "20%"
      }
    ];

    setRebalanceOrders({
      sellOrders,
      buyOrders,
      projectedExposure
    });
  }

  function runRebalanceSimulation() {
    if (!topSector || totalValue <= 0) {
      return;
    }

    const reducePercent = rebalancePercent;

    const reduceValue =
      (topSector.marketValue * reducePercent) / 100;

    const projectedTopSectorValue =
      topSector.marketValue - reduceValue;

    const projectedTopExposure = Math.round(
      (projectedTopSectorValue / totalValue) * 100
    );

    const projectedRisk =
      projectedTopExposure >= 60
        ? "High Risk"
        : projectedTopExposure >= 40
        ? "Moderate Risk"
        : "Balanced";

    setSimulation({
      reducePercent,
      reduceValue,
      currentExposure: topExposure,
      projectedExposure: projectedTopExposure,
      projectedRisk
    });

    generateRebalanceOrders(reducePercent, projectedTopExposure);
  }

  useEffect(() => {
    if (topSector && totalValue > 0) {
      runRebalanceSimulation();
    }
  
  }, [
    rebalancePercent,
    topExposure,
    totalValue,
    topSector?.sector,
    topSector?.marketValue
  ]);

  const totalReturn =
    totalValue - totalPnL > 0
      ? (totalPnL / (totalValue - totalPnL)) * 100
      : 0;

async function executeRebalance() {
  try {
    setExecutingRebalance(true);

    const sellOrders = [];
    const buyOrders = [];

    for (const sector of groupedSectors) {
      for (const holding of sector.holdings) {
        if (sector.sector === "Telecom") {
          const reduceQty = Math.floor(
            Number(holding.quantity || 0) *
              (rebalancePercent / 100)
          );

          if (reduceQty > 0) {
            sellOrders.push({
              symbol: holding.symbol,
              side: "SELL",
              quantity: reduceQty,
              price: Number(
                holding.currentPrice || 0
              ),
              broker:
                holding.broker || "AIB"
            });
          }
        }
      }
    }

    buyOrders.push({
      symbol: "EQTY",
      side: "BUY",
      quantity: 200,
      price: 75.2,
      broker: "AIB"
    });

    buyOrders.push({
      symbol: "KCB",
      side: "BUY",
      quantity: 100,
      price: 66.8,
      broker: "AIB"
    });

    const orders = [
      ...sellOrders,
      ...buyOrders
    ];

    const results = [];

    for (const order of orders) {
      const res = await fetch(
        `${API_URL}/execution/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(order)
        }
      );

      const data = await res.json();

      results.push(data);
    }

    setRebalanceResult(results);

    await loadPortfolio();

    alert(
      `AI Rebalance Executed (${results.length} orders routed)`
    );
  } catch (error) {
    console.error(error);

    alert(
      "Rebalance execution failed."
    );
  } finally {
    setExecutingRebalance(false);
  }
}

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
              Portfolio Heatmap
            </h1>

            <p className="text-slate-400 text-sm mt-2">
              Live exposure, profit/loss, and concentration view.
            </p>
          </div>

          <a
            href="/mobile/portfolio"
            className="bg-slate-800 hover:bg-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-cyan-300"
          >
            ✕ Close
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
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
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950/40 flex items-center justify-center text-xl">
                      {sectorIcon(sectorGroup.sector)}
                    </div>

                    <div>
                      <div className="text-xl font-bold">
                        {sectorGroup.sector}
                      </div>

                      <div className="text-xs text-slate-300 mt-1">
                        {sectorGroup.holdings.length}{" "}
                        {sectorGroup.holdings.length === 1
                          ? "security"
                          : "securities"}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-left md:text-right">
                    <Metric
                      label="Exposure"
                      value={`${exposure}%`}
                      color="text-cyan-300"
                    />

                    <Metric
                      label="Value"
                      value={`KES ${value.toLocaleString()}`}
                    />

                    <Metric
                      label="P&L"
                      value={`${pnl >= 0 ? "+" : ""}KES ${Math.round(
                        pnl
                      ).toLocaleString()}`}
                      color={
                        pnl >= 0
                          ? "text-green-300"
                          : "text-red-300"
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  {sectorGroup.holdings.map((holding) => {
                    const action = getHoldingAction(
                      holding,
                      exposure
                    );

                    return (
                      <a
                        key={`${holding.broker}-${holding.symbol}`}
                        href={`/mobile/stock/${String(
                          holding.symbol
                        ).trim()}`}
                        className="block bg-slate-950/40 rounded-xl p-3 hover:bg-slate-800/70"
                      >
                        <div className="flex justify-between items-center gap-3">
                          <div>
                            <div className="font-bold text-lg">
                              {String(holding.symbol).trim()}
                            </div>

                            <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-slate-400">
                              <span>{holding.broker}</span>

                              <span>
                                Qty:{" "}
                                <span className="text-white font-semibold">
                                  {Number(
                                    holding.quantity || 0
                                  ).toLocaleString()}
                                </span>
                              </span>

                              <span>
                                Avg:{" "}
                                <span className="text-cyan-300 font-semibold">
                                  KES{" "}
                                  {Number(
                                    holding.averageCost || 0
                                  ).toLocaleString()}
                                </span>
                              </span>

                              <span>
                                Px:{" "}
                                <span className="text-yellow-300 font-semibold">
                                  KES{" "}
                                  {Number(
                                    holding.currentPrice || 0
                                  ).toLocaleString()}
                                </span>
                              </span>
                            </div>

                            <div
                              className={`inline-block mt-2 px-2 py-1 rounded-full border text-[10px] font-bold ${action.className}`}
                            >
                              {action.label}
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end">
                            <Sparkline symbol={holding.symbol} />

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
                    );
                  })}
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
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-xl">
                💡
              </div>

              <div>
                <div className="text-cyan-300 font-bold">
                  Coach G Heatmap Insight
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <InfoTile
                    label="Diversification"
                    value={diversificationScore}
                    color="text-cyan-300"
                  />

                  <InfoTile
                    label="Portfolio Risk"
                    value={portfolioRisk}
                    color={
                      portfolioRisk === "High Risk"
                        ? "text-red-300"
                        : portfolioRisk === "Moderate Risk"
                        ? "text-yellow-300"
                        : "text-green-300"
                    }
                  />
                </div>

                <div className="text-sm text-slate-300 mt-2 leading-6">
                  Heatmap groups holdings by sector. Larger exposure groups need closer risk review, while green groups show profitable areas of the portfolio.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MiniSummary
                label="Total Portfolio"
                value={`KES ${Number(totalValue || 0).toLocaleString()}`}
                color="text-cyan-300"
              />

              <MiniSummary
                label="Total P&L"
                value={`${totalPnL >= 0 ? "+" : ""}KES ${Math.round(
                  totalPnL
                ).toLocaleString()}`}
                color={
                  totalPnL >= 0
                    ? "text-green-300"
                    : "text-red-300"
                }
              />

              <MiniSummary
                label="Total Return"
                value={`${totalReturn.toFixed(2)}%`}
                color={
                  totalReturn >= 0
                    ? "text-green-300"
                    : "text-red-300"
                }
              />
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 mt-5">
            Percentages represent share of total portfolio market value.
          </div>
        </div>

        {topSector && topExposure >= 40 && (
          <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
            <div className="text-yellow-300 font-bold text-sm">
              Coach G Risk Alert
            </div>

            <div className="text-xs text-slate-300 mt-1">
              {topExposure}% of your portfolio is concentrated in{" "}
              {topSector.sector}. Consider diversifying to reduce sector concentration risk.
            </div>
          </div>
        )}

        {topSector && topExposure >= 40 && (
          <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="text-purple-300 font-bold text-sm">
              Coach G Rebalance Plan
            </div>

            <div className="space-y-2 mt-3 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>
                  Reduce {topSector.sector} exposure
                </span>

                <span className="text-red-300 font-bold">
                  -{rebalancePercent}%
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  Increase Banking diversification
                </span>

                <span className="text-green-300 font-bold">
                  +10%
                </span>
              </div>

              <div className="flex justify-between">
                <span>
                  Add defensive dividend holdings
                </span>

                <span className="text-cyan-300 font-bold">
                  Recommended
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">
                  Reduce {topSector?.sector} Exposure
                </span>

                <span className="text-cyan-300 font-bold">
                  {rebalancePercent}%
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="50"
                value={rebalancePercent}
                onChange={(e) =>
                  setRebalancePercent(Number(e.target.value))
                }
                className="w-full accent-purple-500"
              />
            </div>

            {simulation && (
              <div className="mt-4 bg-slate-950/60 border border-purple-500/30 rounded-xl p-4">
                <div className="text-purple-300 font-bold text-sm">
                  Simulation Result
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                  <InfoTile
                    label="Current Exposure"
                    value={`${simulation.currentExposure}%`}
                    color="text-red-300"
                  />

                  <InfoTile
                    label="Projected Exposure"
                    value={`${simulation.projectedExposure}%`}
                    color="text-green-300"
                  />

                  <InfoTile
                    label="Suggested Trim Value"
                    value={`KES ${Math.round(
                      simulation.reduceValue
                    ).toLocaleString()}`}
                    color="text-cyan-300"
                  />

                  <InfoTile
                    label="Projected Risk"
                    value={simulation.projectedRisk}
                    color="text-green-300"
                  />
                </div>

                <div className="mt-5 border-t border-purple-500/20 pt-4">
                  <div className="text-purple-300 font-bold text-sm">
                    Projected Allocation
                  </div>

                  <AllocationBar
                    label={topSector?.sector || "Top Sector"}
                    current={simulation.currentExposure}
                    projected={simulation.projectedExposure}
                  />

                  <AllocationBar
                    label="Banking"
                    current={2}
                    projected={Math.min(
                      100,
                      2 + Math.round(simulation.reducePercent * 0.5)
                    )}
                  />

                  <AllocationBar
                    label="Commercial"
                    current={19}
                    projected={Math.min(
                      100,
                      19 + Math.round(simulation.reducePercent * 0.3)
                    )}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 bg-slate-950/60 border border-cyan-500/30 rounded-xl p-4">
              <div className="text-cyan-300 font-bold text-sm">
                Proposed AI Rebalance Orders
              </div>

              <div className="mt-3">
                <div className="text-red-300 font-bold text-xs mb-2">
                  SELL
                </div>

                <div className="space-y-2">
                  {rebalanceOrders.sellOrders.map((order) => (
                    <div
                      key={`${order.symbol}-${order.broker}`}
                      className="flex justify-between bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs"
                    >
                      <span>
                        {order.symbol} • {order.broker}
                      </span>

                      <span className="font-bold">
                        Sell {order.quantity.toLocaleString()} @ KES{" "}
                        {Number(order.price || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-green-300 font-bold text-xs mb-2">
                  BUY TARGETS
                </div>

                <div className="space-y-2">
                  {rebalanceOrders.buyOrders.map((order) => (
                    <div
                      key={order.symbol}
                      className="flex justify-between bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-xs"
                    >
                      <span>
                        {order.symbol} • {order.sector}
                      </span>

                      <span className="font-bold">
                        Allocate {order.allocation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <InfoTile
                  label="Total Sell Orders"
                  value={rebalanceOrders.sellOrders.length}
                  color="text-red-300"
                />

                <InfoTile
                  label="Projected Exposure"
                  value={`${rebalanceOrders.projectedExposure || 0}%`}
                  color="text-green-300"
                />
              </div>

   <button
  type="button"
  onClick={() => {
    console.log("Opening rebalance review modal");
    setShowExecutionReview(true);
  }}
  className="w-full mt-5 rounded-xl py-4 font-bold text-white bg-gradient-to-r from-fuchsia-600 to-purple-500 hover:opacity-90"
>
  Review & Execute Rebalance
</button>

{rebalanceResult && (
  <div className="mt-4 bg-slate-950/60 border border-green-500/30 rounded-xl p-4">
    <div className="text-green-300 font-bold text-sm">
      Rebalance Execution Complete
    </div>

    <div className="mt-3 space-y-2">
      {rebalanceResult.map((result, index) => (
        <div
          key={index}
          className="flex justify-between bg-slate-900 rounded-lg p-3 text-xs"
        >
          <div>
            {result.order?.symbol || "Order"}
          </div>

          <div className="text-cyan-300 font-bold">
            {result.order?.status || "ROUTED"}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
            </div>
          </div>
        )}
      </div>

{showExecutionReview && (
  <div className="fixed inset-0 bg-black/70 z-[999] flex items-center justify-center p-4">
    <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-5 w-full max-w-lg shadow-2xl">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xl font-bold text-white">
            Coach G Rebalance Review
          </div>

          <div className="text-xs text-slate-400 mt-1">
            Review estimated orders before routing to execution.
          </div>
        </div>

        <button
          onClick={() => setShowExecutionReview(false)}
          className="text-slate-400 hover:text-white text-xl"
        >
          ✕
        </button>
      </div>

      <div className="mt-5">
        <div className="text-red-300 font-bold text-xs mb-2">
          SELL ORDERS
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {rebalanceOrders.sellOrders.map((order) => (
            <div
              key={`${order.symbol}-${order.broker}`}
              className="flex justify-between bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs"
            >
              <span>
                {order.symbol} • {order.broker}
              </span>

              <span className="font-bold">
                {order.quantity.toLocaleString()} @ KES{" "}
                {Number(order.price || 0).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-green-300 font-bold text-xs mb-2">
          BUY TARGETS
        </div>

        <div className="space-y-2">
          {rebalanceOrders.buyOrders.map((order) => (
            <div
              key={order.symbol}
              className="flex justify-between bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-xs"
            >
              <span>
                {order.symbol} • {order.sector}
              </span>

              <span className="font-bold">
                Allocate {order.allocation}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5 text-xs">
        <InfoTile
          label="Projected Exposure"
          value={`${rebalanceOrders.projectedExposure || 0}%`}
          color="text-green-300"
        />

        <InfoTile
          label="Projected Risk"
          value={simulation?.projectedRisk || "Balanced"}
          color="text-green-300"
        />
      </div>

      <div className="mt-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
        <div className="text-yellow-300 font-bold text-xs">
          Execution Notice
        </div>

        <div className="text-xs text-slate-300 mt-1">
          Coach G will route these orders through the execution engine.
          Orders may fill partially depending on liquidity and broker status.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          onClick={() => setShowExecutionReview(false)}
          className="bg-slate-800 hover:bg-slate-700 rounded-xl py-3 font-bold text-sm"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            setShowExecutionReview(false);
            executeRebalance();
          }}
          disabled={executingRebalance}
          className="bg-purple-600 hover:bg-purple-500 rounded-xl py-3 font-bold text-sm"
        >
          Confirm Execute
        </button>
      </div>
    </div>
  </div>
)}

{showExecutionReview && (
  <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4">
    <div className="bg-slate-950 border border-purple-500/40 rounded-2xl p-5 w-full max-w-lg shadow-2xl">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xl font-bold text-white">
            Coach G Rebalance Review
          </div>

          <div className="text-xs text-slate-400 mt-1">
            Review estimated orders before routing.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowExecutionReview(false)}
          className="text-slate-400 hover:text-white text-xl"
        >
          ✕
        </button>
      </div>

      <div className="mt-5 text-sm text-slate-300">
        Modal opened successfully.
      </div>

      <button
        type="button"
        onClick={() => {
          setShowExecutionReview(false);
          executeRebalance();
        }}
        className="w-full mt-5 bg-purple-600 hover:bg-purple-500 rounded-xl py-3 font-bold text-sm"
      >
        Confirm Execute
      </button>
    </div>
  </div>
)}
      <MobileBottomNav />
    </motion.div>
  );
}

function Metric({ label, value, color = "text-white" }) {
  return (
    <div>
      <div className="text-[10px] text-slate-400">
        {label}
      </div>

      <div className={`text-sm font-bold ${color}`}>
        {value}
      </div>
    </div>
  );
}

function InfoTile({ label, value, color }) {
  return (
    <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800">
      <div className="text-[10px] text-slate-400">
        {label}
      </div>

      <div className={`font-bold mt-1 ${color}`}>
        {value}
      </div>
    </div>
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

function AllocationBar({ label, current, projected }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-300">
          {label}
        </span>

        <span className="text-cyan-300 font-bold">
          {current}% → {projected}%
        </span>
      </div>

      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${projected}%` }}
          transition={{ duration: 0.35 }}
          className={
            projected >= 60
              ? "h-full bg-red-500"
              : projected >= 40
              ? "h-full bg-yellow-400"
              : "h-full bg-green-400"
          }
        />
      </div>
    </div>
  );
}

function Sparkline({ symbol }) {
  const seed = String(symbol || "")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const points = Array.from({ length: 8 }).map((_, index) => {
    const value =
      12 +
      Math.sin((seed + index) * 0.9) * 6 +
      index * 1.4;

    return {
      x: index * 12,
      y: Math.max(4, Math.min(28, 32 - value))
    };
  });

  const path = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const positive =
    points[points.length - 1].y < points[0].y;

async function executeRebalance() {
  try {
    setExecutingRebalance(true);

    const sellOrders = [];

    const buyOrders = [];

    for (const sector of groupedSectors) {
      for (const holding of sector.holdings) {
        if (
          sector.sector === "Telecom"
        ) {
          const reduceQty = Math.floor(
            Number(holding.quantity || 0) *
              (rebalancePercent / 100)
          );

          if (reduceQty > 0) {
            sellOrders.push({
              symbol: holding.symbol,
              side: "SELL",
              quantity: reduceQty,
              price: Number(
                holding.currentPrice || 0
              ),
              broker:
                holding.broker || "AIB"
            });
          }
        }
      }
    }

    buyOrders.push({
      symbol: "EQTY",
      side: "BUY",
      quantity: 200,
      price: 75.2,
      broker: "AIB"
    });

    buyOrders.push({
      symbol: "KCB",
      side: "BUY",
      quantity: 100,
      price: 66.8,
      broker: "AIB"
    });

    const orders = [
      ...sellOrders,
      ...buyOrders
    ];

    const results = [];

    for (const order of orders) {
      const res = await fetch(
        `${API_URL}/execution/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify(order)
        }
      );

      const data = await res.json();

      results.push(data);
    }

    setRebalanceResult(results);

    await loadPortfolio();

    alert(
      `AI Rebalance Executed (${results.length} orders routed)`
    );
  } catch (error) {
    console.error(error);

    alert(
      "Rebalance execution failed."
    );
  } finally {
    setExecutingRebalance(false);
  }
}

  return (
    <svg
      viewBox="0 0 84 32"
      className="w-20 h-8"
      fill="none"
    >
      <path
        d={path}
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}