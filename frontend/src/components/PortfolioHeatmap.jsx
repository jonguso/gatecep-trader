import { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function riskColor(level) {
  if (level === "HIGH") {
    return "bg-red-500/30 border-red-500";
  }

  if (level === "MEDIUM") {
    return "bg-yellow-500/30 border-yellow-500";
  }

  return "bg-green-500/30 border-green-500";
}

export default function PortfolioHeatmap() {
  const [heatmap, setHeatmap] = useState(null);

  async function loadHeatmap() {
    try {
      const res = await fetch(
        `${API_URL}/portfolio/heatmap`
      );

      const data = await res.json();

      if (data.ok) {
        setHeatmap(data.heatmap);
      }
    } catch (error) {
      console.error(
        "Failed to load portfolio heatmap:",
        error
      );
    }
  }

  useEffect(() => {
    loadHeatmap();

    const interval = setInterval(
      loadHeatmap,
      10000
    );

    return () => clearInterval(interval);
  }, []);

  if (!heatmap) {
    return (
      <div className="bg-slate-900 rounded-2xl p-6 text-white">
        Loading heatmap...
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            Portfolio Heatmap
          </h2>

          <p className="text-slate-400 text-sm">
            Live portfolio exposure and risk
          </p>
        </div>

        <div className="text-right">
          <div className="text-sm text-slate-400">
            Portfolio Value
          </div>

          <div className="text-2xl font-bold text-cyan-400">
            KES {heatmap.totalMarketValue}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {heatmap.heatmap.map((holding) => (
          <div
            key={holding.symbol}
            className={`rounded-2xl border p-5 ${riskColor(
              holding.riskLevel
            )}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-300">
                  Symbol
                </div>

                <div className="text-3xl font-bold">
                  {holding.symbol}
                </div>
              </div>

              <div className="text-xs px-3 py-1 rounded-full bg-slate-900/40">
                {holding.riskLevel}
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Broker</span>
                <span className="font-bold">
                  {holding.broker}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Quantity</span>
                <span className="font-bold">
                  {holding.quantity}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Market Value</span>
                <span className="font-bold">
                  KES {holding.marketValue}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Portfolio Weight</span>
                <span className="font-bold">
                  {holding.weight}%
                </span>
              </div>

              <div className="flex justify-between">
                <span>PnL</span>
                <span
                  className={
                    holding.unrealizedPnL >= 0
                      ? "text-green-300 font-bold"
                      : "text-red-300 font-bold"
                  }
                >
                  {holding.unrealizedPnL}
                </span>
              </div>

              <div className="flex justify-between">
                <span>PnL %</span>
                <span
                  className={
                    holding.unrealizedPnLPercent >= 0
                      ? "text-green-300 font-bold"
                      : "text-red-300 font-bold"
                  }
                >
                  {holding.unrealizedPnLPercent}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}