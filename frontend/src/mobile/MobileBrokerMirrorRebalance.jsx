import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const brokerLink = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("gatecepBrokerLink") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  const broker = brokerLink.broker || "AIB-AXYS";
  const clientNumber = brokerLink.clientNumber || "";
  const cdsNumber = brokerLink.cdsNumber || "";

  const brokerQuery = `clientNumber=${encodeURIComponent(
    clientNumber
  )}&cdsNumber=${encodeURIComponent(cdsNumber)}`;

  const [plan, setPlan] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [showSimulator, setShowSimulator] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);

  const [risk, setRisk] = useState("balanced");
  const [goal, setGoal] = useState("balanced_growth");
  const [amount, setAmount] = useState(10000);
  const [intensity, setIntensity] = useState(50);

  async function loadPlan() {
    const scoreRes = await fetch(
      `${API_URL}/broker-mirror-score/${broker}?${brokerQuery}`
    );
    const score = await scoreRes.json();

    const rebalanceRes = await fetch(
      `${API_URL}/broker-mirror-rebalance/${broker}?risk=${risk}&goal=${goal}&${brokerQuery}`
    );
    const rebalance = await rebalanceRes.json();

    const heatmapRes = await fetch(
      `${API_URL}/broker-heatmap/${broker}?${brokerQuery}`
    );
    const heatmapData = await heatmapRes.json();

    setPlan({
      ...rebalance,
      score
    });

    setHeatmap(heatmapData.heatmap || []);
  }

  async function loadInvestmentPlan() {
    const res = await fetch(
      `${API_URL}/investment-planner/${broker}?amount=${amount}&goal=${goal}&risk=${risk}&intensity=${intensity}&${brokerQuery}`
    );

    const data = await res.json();

    setPlan((current) => ({
      ...current,
      investmentPlan: data
    }));
  }

  useEffect(() => {
    loadPlan();
  }, [risk, goal]);

  useEffect(() => {
    document.body.style.overflow = showSimulator ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSimulator]);

  useEffect(() => {
    function handleEsc(event) {
      if (event.key === "Escape") {
        setShowSimulator(false);
        setSelectedSector(null);
      }
    }

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
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
      acc[sector].totalValue += Number(item.value || item.marketValue || 0);
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
      (sum, item) => sum + Number(item.profitLoss || 0),
      0
    ),
    profitLossPct:
      heatmap.length > 0
        ? heatmap.reduce(
            (sum, item) => sum + Number(item.changePct || 0),
            0
          ) / heatmap.length
        : 0
  };

  const largestSector = sectorRows[0];

  const diversificationScore = Math.min(sectorRows.length * 4, 30);

  const cashScore =
    summary.availableCash > 5000
      ? 20
      : summary.availableCash > 1000
      ? 12
      : 5;

  const riskPenalty =
    plan.score?.rating === "HIGH_RISK"
      ? 20
      : 8;

  const profitScore =
    summary.profitLoss > 0
      ? 20
      : -10;

  const healthScore = Math.max(
    0,
    Math.min(
      100,
      diversificationScore +
        cashScore +
        profitScore -
        riskPenalty +
        40
    )
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-16">
      <h1 className="text-2xl font-bold">
        Coach G Portfolio Analysis
      </h1>

      <p className="text-sm text-slate-400 mt-2">
        Advisory only. Gatecep will not execute trades.
      </p>

      <div className="mt-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
        <div className="font-bold text-cyan-300">
          Linked Broker
        </div>

        <div className="text-sm text-slate-300 mt-2">
          Broker: {broker}
        </div>

        <div className="text-sm text-slate-300">
          Client Number: {clientNumber || "N/A"}
        </div>

        <div className="text-sm text-slate-300">
          CDS Number: {cdsNumber || "N/A"}
        </div>
      </div>

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
            largestSector
              ? `${largestSector.sector} (${percent(
                  largestSector.totalValue,
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
                <defs>
                  <filter id="glow">
                    <feGaussianBlur
                      stdDeviation="3"
                      result="coloredBlur"
                    />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <Pie
                  data={sectorRows.map((sector) => ({
                    name: sector.sector,
                    value: sector.totalValue,
                    weight:
                      summary.portfolioValue > 0
                        ? (sector.totalValue / summary.portfolioValue) * 100
                        : 0
                  }))}
                  onClick={(data) => {
                    const sector = sectorRows.find(
                      (item) => item.sector === data.name
                    );

                    setSelectedSector(sector || null);
                  }}
                  style={{
                    cursor: "pointer"
                  }}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  outerRadius={135}
                  paddingAngle={2}
                  label={({ cx, cy, midAngle, outerRadius, weight }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 24;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight={700}
                      >
                        {Number(weight || 0).toFixed(2)}%
                      </text>
                    );
                  }}
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
                  filter="url(#glow)"
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                >
                  <tspan
                    x="50%"
                    dy="-0.5em"
                    fontSize="12"
                    fill="#94a3b8"
                  >
                    Total Value
                  </tspan>

                  <tspan
                    x="50%"
                    dy="1.4em"
                    fontSize="10"
                    fill="#94a3b8"
                  >
                    KES
                  </tspan>

                  <tspan
                    x="50%"
                    dy="1.3em"
                    fontSize="18"
                    fontWeight="bold"
                  >
                    {money(summary.portfolioValue)}
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
                onClick={() => setSelectedSector(sector)}
                className="grid grid-cols-3 items-center py-3 border-b border-slate-800 text-sm cursor-pointer active:scale-[0.98] transition"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: COLORS[index % COLORS.length]
                    }}
                  />

                  <span
                    className={
                      sector.totalProfitLoss >= 0
                        ? "text-green-300"
                        : "text-red-300"
                    }
                  >
                    {sector.totalProfitLoss >= 0 ? "▲" : "▼"}{" "}
                    {sector.sector}
                  </span>
                </div>

                <div className="text-right">
                  KES {money(sector.totalValue)}
                </div>

                <div className="text-right">
                  {percent(
                    sector.totalValue,
                    summary.portfolioValue
                  )}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 mt-5">
        <div className="font-bold text-cyan-300">
          Coach G Recommendations
        </div>

        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <div>
            • Largest exposure is{" "}
            <span className="font-bold text-purple-300">
              {largestSector?.sector || "N/A"}
            </span>
            . Avoid adding more unless it supports your goal.
          </div>

          <div>
            • Use new money to strengthen underrepresented sectors.
          </div>

          <div>
            • Since available cash is{" "}
            <span className="font-bold text-green-300">
              KES {money(summary.availableCash)}
            </span>
            , Coach G will prioritize future deposits or new investment amounts.
          </div>

          <div>
            • Open simulator to test how new capital changes allocation.
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mt-5">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-slate-400 text-sm">
              Portfolio Health
            </div>

            <div className="text-3xl font-bold text-cyan-300">
              {healthScore}/100
            </div>
          </div>

          <div className="text-right text-xs text-slate-400">
            Coach G Score
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <ScoreRow label="Diversification" value={`+${diversificationScore}`} color="text-cyan-300" />
          <ScoreRow label="Cash Position" value={`+${cashScore}`} color="text-green-300" />
          <ScoreRow label="Risk Exposure" value={`-${riskPenalty}`} color="text-red-300" />
          <ScoreRow
            label="Profitability"
            value={`${profitScore >= 0 ? "+" : ""}${profitScore}`}
            color={profitScore >= 0 ? "text-green-300" : "text-red-300"}
          />
        </div>
      </div>

      <button
        onClick={() => navigate("/mobile/holding-details")}
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
        className="w-full mt-6 bg-purple-600 rounded-2xl p-4 font-bold shadow-lg"
      >
        Simulate Coach G Recommendations
      </button>

      {selectedSector && (
        <SectorModal
          sector={selectedSector}
          onClose={() => setSelectedSector(null)}
        />
      )}

      {showSimulator && (
        <div
          className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 overflow-y-auto pt-8 pb-8"
          onClick={() => setShowSimulator(false)}
        >
          <div
            className="bg-slate-950 border border-purple-500/40 rounded-3xl p-5 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
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

            <FormSelect
              label="Investment Goal"
              value={goal}
              onChange={setGoal}
              options={[
                ["wealth_growth", "Wealth Growth"],
                ["dividend", "Dividend Income"],
                ["balanced_growth", "Balanced Growth"],
                ["preservation", "Capital Preservation"]
              ]}
            />

            <FormSelect
              label="Scenario"
              value={risk}
              onChange={setRisk}
              options={[
                ["conservative", "Conservative"],
                ["balanced", "Balanced"],
                ["aggressive", "Aggressive"]
              ]}
            />

            <div className="mt-5">
              <label className="text-sm text-slate-400">
                Amount to Invest
              </label>

              <input
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-2 w-full bg-slate-900 border border-purple-500 rounded-xl p-3"
              />
            </div>

            <div className="mt-5">
              <div className="flex justify-between">
                <label className="text-sm text-slate-400">
                  Rebalance Intensity
                </label>

                <span className="text-purple-300 font-bold">
                  {intensity}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={intensity}
                onChange={(event) => setIntensity(event.target.value)}
                className="w-full mt-3"
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

function SectorModal({ sector, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto pt-8 pb-8">
      <div className="bg-slate-950 border border-cyan-500/40 rounded-3xl p-5 w-full max-w-3xl mx-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold text-cyan-300">
            {sector.sector}
          </h2>

          <button
            onClick={onClose}
            className="text-slate-400"
          >
            Close
          </button>
        </div>

        <p className="text-sm text-slate-400 mt-2">
          {sector.securities.length} securities • KES{" "}
          {money(sector.totalValue)}
        </p>

        <div className="mt-5 space-y-3">
          {sector.securities.map((sec) => (
            <div
              key={sec.symbol}
              className="bg-slate-900 rounded-2xl p-4 border border-slate-800"
            >
              <div className="flex justify-between">
                <div className="font-bold">
                  {sec.symbol}
                </div>

                <div
                  className={
                    sec.profitLoss >= 0
                      ? "text-green-300"
                      : "text-red-300"
                  }
                >
                  KES {money(sec.profitLoss)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-slate-400">
                <div>
                  Qty: {Number(sec.quantity || 0).toLocaleString()}
                </div>

                <div>
                  Price: KES {money(sec.price)}
                </div>

                <div>
                  Value: KES {money(sec.value || sec.marketValue)}
                </div>

                <div>
                  Return: {Number(sec.changePct || 0).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

function ScoreRow({ label, value, color }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <div className="mt-5">
      <label className="text-sm text-slate-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full bg-slate-900 border border-purple-500 rounded-xl p-3"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
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

  return Number(
    (Number(value || 0) / Number(total || 1)) * 100
  ).toFixed(2);
}