import { useEffect, useMemo, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileHoldingDetails() {
  const [heatmap, setHeatmap] = useState([]);
  const [expandedSector, setExpandedSector] = useState(null);

  async function loadHoldings() {
    const res = await fetch(`${API_URL}/broker-heatmap/AIB`);
    const data = await res.json();
    setHeatmap(data.heatmap || []);
  }

  useEffect(() => {
    loadHoldings();
  }, []);

  const sectorRows = useMemo(() => {
    const grouped = heatmap.reduce((acc, item) => {
      const sector = item.sector || "Unknown";

      if (!acc[sector]) {
        acc[sector] = {
          sector,
          securities: [],
          totalValue: 0,
          totalProfitLoss: 0
        };
      }

      acc[sector].securities.push(item);
      acc[sector].totalValue += Number(item.value || 0);
      acc[sector].totalProfitLoss += Number(item.profitLoss || 0);

      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => Number(b.totalValue || 0) - Number(a.totalValue || 0)
    );
  }, [heatmap]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-24">
      <button
        onClick={() => {
          window.location.href = "/mobile/broker-rebalance";
        }}
        className="text-cyan-300 text-sm mb-4"
      >
        ← Back to Portfolio Analysis
      </button>

      <h1 className="text-2xl font-bold">
        Holding Details
      </h1>

      <p className="text-sm text-slate-400 mt-2">
        Holdings grouped by sector using current portfolio valuation.
      </p>

      <div className="mt-6 space-y-3">
        {sectorRows.map((sector) => {
          const expanded = expandedSector === sector.sector;

          return (
            <div
              key={sector.sector}
              className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800"
            >
              <button
                className="w-full p-4 flex justify-between text-left"
                onClick={() =>
                  setExpandedSector(expanded ? null : sector.sector)
                }
              >
                <div>
                  <div className="font-bold">
                    {sector.sector}
                  </div>

                  <div className="text-xs text-slate-400">
                    {sector.securities.length} securities
                  </div>
                </div>

                <div className="text-right">
                  <div>
                    KES {money(sector.totalValue)}
                  </div>

                  <div
                    className={
                      Number(sector.totalProfitLoss || 0) >= 0
                        ? "text-xs text-green-300"
                        : "text-xs text-red-300"
                    }
                  >
                    P/L: KES {money(sector.totalProfitLoss)}
                  </div>
                </div>
              </button>

              {expanded && (
                <div className="px-4 pb-4">
                  {sector.securities.map((sec) => (
                    <div
                      key={sec.symbol}
                      className="bg-slate-950 rounded-xl p-3 mb-2 border border-slate-800"
                    >
                      <div className="flex justify-between">
                        <div className="font-bold">
                          {sec.symbol}
                        </div>

                        <div
                          className={
                            Number(sec.profitLoss || 0) >= 0
                              ? "text-green-300"
                              : "text-red-300"
                          }
                        >
                          KES {money(sec.profitLoss)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-400">
                        <div>
                          Qty:{" "}
                          <span className="text-white">
                            {Number(sec.quantity || 0).toLocaleString()}
                          </span>
                        </div>

                        <div>
                          Price:{" "}
                          <span className="text-white">
                            KES {money(sec.price)}
                          </span>
                        </div>

                        <div>
                          Value:{" "}
                          <span className="text-white">
                            KES {money(sec.value)}
                          </span>
                        </div>

                        <div>
                          Return:{" "}
                          <span
                            className={
                              Number(sec.changePct || 0) >= 0
                                ? "text-green-300"
                                : "text-red-300"
                            }
                          >
                            {Number(sec.changePct || 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}