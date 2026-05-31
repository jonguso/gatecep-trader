import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

const COLORS = [
  "#06b6d4",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#ec4899",
  "#14b8a6"
];

export default function MobileBrokerMirrorRebalance() {
  const [plan, setPlan] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [expandedSector, setExpandedSector] = useState(null);

  const [showSimulator, setShowSimulator] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [risk, setRisk] = useState("balanced");
  const [goal, setGoal] = useState("balanced_growth");
  const [amount, setAmount] = useState(10000);
  const [intensity, setIntensity] = useState(50);

  async function loadPlan() {
    const scoreRes = await fetch(`${API_URL}/broker-mirror-score/AIB`);
    const score = await scoreRes.json();

    const rebalanceRes = await fetch(
      `${API_URL}/broker-mirror-rebalance/AIB?risk=${risk}`
    );
    const rebalance = await rebalanceRes.json();

    const heatmapRes = await fetch(`${API_URL}/broker-heatmap/AIB`);
    const heatmapData = await heatmapRes.json();

    setPlan({
      ...rebalance,
      score
    });

    setHeatmap(heatmapData.heatmap || []);
  }

  async function loadInvestmentPlan() {
    const res = await fetch(
      `${API_URL}/investment-planner/AIB?amount=${amount}&goal=${goal}&risk=${risk}&intensity=${intensity}`
    );

    const data = await res.json();

    setPlan((current) => ({
      ...current,
      investmentPlan: data
    }));
  }

  useEffect(() => {
    loadPlan();
  }, [risk]);

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

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-5">
        Loading Coach G...
      </div>
    );
  }

  const summary = {
    portfolioValue: plan.score?.totalValue || 0,
    availableCash: plan.score?.cashSummary?.ledgerBalance || 0,
    netWorth: plan.score?.netWorth || 0,
    profitLoss: heatmap.reduce(
      (sum, x) => sum + Number(x.profitLoss || 0),
      0
    ),
    profitLossPct:
      heatmap.length > 0
        ? heatmap.reduce(
            (sum, x) => sum + Number(x.changePct || 0),
            0
          ) / heatmap.length
        : 0
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-32">
      <h1 className="text-2xl font-bold">
        Coach G Portfolio Analysis
      </h1>

      <p className="text-sm text-slate-400 mt-2">
        Advisory only. Gatecep will not execute trades.
      </p>

      <div className="bg-slate-900 rounded-2xl p-4 mt-4 border border-slate-800">
        <div className="grid grid-cols-2 gap-4">
          <Metric
            label="Portfolio Value"
            value={`KES ${money(summary.portfolioValue)}`}
            color="text-cyan-300"
          />

          <Metric
            label="Available Cash"
            value={`KES ${money(summary.availableCash)}`}
            color="text-green-300"
          />

          <Metric
            label="Net Worth"
            value={`KES ${money(summary.netWorth)}`}
            color="text-white"
          />

          <Metric
            label="Net Gain/Loss"
            value={`KES ${money(summary.profitLoss)} (${Number(
              summary.profitLossPct || 0
            ).toFixed(2)}%)`}
            color={
              summary.profitLoss >= 0
                ? "text-green-300"
                : "text-red-300"
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <SmallCard
            label="Risk"
            value={plan.score?.rating || "N/A"}
            color="text-red-300"
          />

          <SmallCard
            label="Sectors"
            value={sectorRows.length}
            color="text-cyan-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <SmallCard
          label="Diversification"
          value={sectorRows.length >= 5 ? "GOOD" : "MODERATE"}
          color="text-cyan-300"
          className="bg-cyan-500/10 border-cyan-500/30"
        />

        <SmallCard
          label="Largest Sector"
          value={
            sectorRows[0]
              ? `${sectorRows[0].sector} (${percent(
                  sectorRows[0].totalValue,
                  summary.portfolioValue
                )}%)`
              : "N/A"
          }
          color="text-purple-300"
          className="bg-purple-500/10 border-purple-500/30"
        />
      </div>

      <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 mt-4">
        <div className="font-bold text-purple-300">
          Coach G Summary
        </div>

        <p className="text-sm mt-2 text-slate-300">
          {plan.score?.rating === "HIGH_RISK"
            ? "Portfolio concentration risk detected. Future investments should improve diversification."
            : "Portfolio appears reasonably diversified."}
        </p>
      </div>

      <h2 className="text-3xl font-bold mt-8 mb-4">
        Sector Allocation
      </h2>

      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div style={{ width: "100%", height: 340 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={sectorRows.map((sector) => ({
                    name: sector.sector,
                    value: sector.totalValue,
                    weight:
                      summary.portfolioValue > 0
                        ? (sector.totalValue / summary.portfolioValue) * 100
                        : 0
                  }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  label={({ weight }) =>
                    `${Number(weight || 0).toFixed(2)}%`
                  }
                >
                  {sectorRows.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => [
                    `KES ${money(value)}`,
                    "Value"
                  ]}
                />

                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                >
                  <tspan x="50%" dy="-0.8em" fontSize="14">
                    Total Value
                  </tspan>
                  <tspan x="50%" dy="1.5em" fontSize="22" fontWeight="bold">
                    KES {money(summary.portfolioValue)}
                  </tspan>
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <div className="grid grid-cols-3 text-sm text-slate-400 border-b border-slate-800 pb-2 mb-3">
              <div>Sector</div>
              <div className="text-right">Value</div>
              <div className="text-right">Weight</div>
            </div>

            {sectorRows.map((sector, index) => (
              <div
                key={sector.sector}
                className="grid grid-cols-3 items-center py-3 border-b border-slate-800 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: COLORS[index % COLORS.length]
                    }}
                  />
                  <span>{sector.sector}</span>
                </div>

                <div className="text-right">
                  KES {money(sector.totalValue)}
                </div>

                <div className="text-right">
                  {percent(sector.totalValue, summary.portfolioValue)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

     <button
  onClick={() => {
    window.location.href = "/mobile/holding-details";
  }}
  className="w-full bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 mt-6 font-bold text-cyan-300"
>
  Holding Details
</button>

       <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mt-5">
        <div className="font-bold text-yellow-300">
          Coach G Risk Alert
        </div>

        <p className="text-sm mt-2">
          {plan.score?.cashSummary?.cashAdvice ||
            "Cash level is acceptable."}
        </p>
      </div>

      <button
        onClick={() => {
          setShowSimulator(true);
          setShowResults(false);
        }}
        className="
fixed
bottom-24
left-4
right-4
z-20
bg-purple-600
rounded-2xl
p-4
font-bold
shadow-lg
"
      >
        Simulate Coach G Recommendations
      </button>

      {showSimulator && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50">
          <div className="bg-slate-950 border-t border-purple-500/40 rounded-t-3xl p-5 w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-purple-300">
                  Coach G Investment Simulator
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Test how new money could improve your portfolio.
                </p>
              </div>

              <button
                onClick={() => setShowSimulator(false)}
                className="text-slate-400"
              >
                Close
              </button>
            </div>

            <div className="mt-5">
              <label className="text-sm text-slate-400">
                Investment Goal
              </label>

              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="mt-2 w-full bg-slate-900 border border-purple-500 rounded-xl p-3"
              >
                <option value="wealth_growth">Wealth Growth</option>
                <option value="dividend">Dividend Income</option>
                <option value="balanced_growth">Balanced Growth</option>
                <option value="preservation">Capital Preservation</option>
              </select>
            </div>

            <div className="mt-5">
              <label className="text-sm text-slate-400">
                Scenario
              </label>

              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                className="mt-2 w-full bg-slate-900 border border-purple-500 rounded-xl p-3"
              >
                <option value="conservative">Conservative</option>
                <option value="balanced">Balanced</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>

            <div className="mt-5">
              <label className="text-sm text-slate-400">
                Amount to Invest
              </label>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-2 w-full bg-slate-900 border border-purple-500 rounded-xl p-3"
              />
            </div>

            <button
              onClick={async () => {
                await loadInvestmentPlan();
                setShowResults(true);
              }}
              className="w-full bg-purple-600 rounded-2xl p-4 font-bold mt-5"
            >
              View Simulation Results
            </button>

            {showResults && plan.investmentPlan && (
              <div className="mt-6">
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <div className="font-bold text-cyan-300">
                    Projected Value
                  </div>

                  <div className="text-xl font-bold mt-2">
                    KES {money(plan.investmentPlan.projectedPortfolioValue)}
                  </div>

                  <div className="text-sm text-slate-400 mt-2">
                    Risk Direction:{" "}
                    {plan.investmentPlan.riskDirection || "N/A"}
                  </div>
                </div>

                <h3 className="font-bold text-green-300 mt-5">
                  Buy Recommendations
                </h3>

                {plan.investmentPlan.recommendations?.map((item) => (
                  <div
                    key={item.symbol}
                    className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mt-2"
                  >
                    <div className="font-bold text-green-300">
                      {item.symbol}
                    </div>

                    <div className="text-xs text-slate-400">
                      {item.name} • {item.sector}
                    </div>

                    <div className="text-sm mt-2">
                      Allocate KES {money(item.suggestedAmount)}
                    </div>

                    <div className="text-sm text-cyan-300">
                      Estimated Shares: {item.estimatedShares}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div>
      <div className="text-xs text-slate-400">
        {label}
      </div>
      <div className={`${color} text-xl font-bold`}>
        {value}
      </div>
    </div>
  );
}

function SmallCard({
  label,
  value,
  color,
  className = "bg-slate-950 border-slate-800"
}) {
  return (
    <div className={`${className} border rounded-xl p-3`}>
      <div className="text-xs text-slate-400">
        {label}
      </div>
      <div className={`${color} font-bold`}>
        {value}
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

function percent(value, total) {
  if (!total) return "0.00";

  return Number((Number(value || 0) / Number(total || 1)) * 100).toFixed(2);
}