import { useEffect, useMemo, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileBrokerMirrorRebalance() {
  const [plan, setPlan] = useState(null);
  const [risk, setRisk] = useState("balanced");
  const [heatmap, setHeatmap] = useState([]);
  const [expandedSector, setExpandedSector] = useState(null);

  const [selectedExplanation, setSelectedExplanation] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const [showSimulator, setShowSimulator] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [amount, setAmount] = useState(10000);
  const [intensity, setIntensity] = useState(50);
  const [goal, setGoal] = useState("balanced_growth");

  async function loadPlan() {
    const rebalanceRes = await fetch(
      `${API_URL}/broker-mirror-rebalance/AIB?risk=${risk}`
    );

    const rebalance = await rebalanceRes.json();
    setPlan(rebalance);

    const heatmapRes = await fetch(
      `${API_URL}/broker-heatmap/AIB`
    );

    const heatmapData = await heatmapRes.json();
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

  async function openExplanation(symbol) {
    try {
      setLoadingExplanation(true);

      const res = await fetch(
        `${API_URL}/broker-explain/AIB/${symbol}`
      );

      const data = await res.json();
      setSelectedExplanation(data);
    } catch (error) {
      setSelectedExplanation({
        ok: false,
        error: error.message
      });
    } finally {
      setLoadingExplanation(false);
    }
  }

  useEffect(() => {
    loadPlan();
  }, [risk]);

  const groupedSectors = useMemo(() => {
    return heatmap.reduce((acc, item) => {
      const sector = item.sector || "Unknown";

      if (!acc[sector]) {
        acc[sector] = {
          sector,
          securities: [],
          totalValue: 0,
          totalTrend: 0
        };
      }

      acc[sector].securities.push(item);
      acc[sector].totalValue += Number(item.value || 0);
      acc[sector].totalTrend += Number(item.changePct || 0);

      return acc;
    }, {});
  }, [heatmap]);

  const sectorRows = useMemo(() => {
    return Object.values(groupedSectors).sort(
      (a, b) => Number(b.totalValue || 0) - Number(a.totalValue || 0)
    );
  }, [groupedSectors]);

  const largestSector = sectorRows[0];

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 text-white">
        Loading Coach G advisory plan...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-40">
      <h1 className="text-2xl font-bold">
        Coach G Portfolio Analysis
      </h1>

      <p className="text-sm text-slate-400 mt-2">
        Advisory only. Gatecep will not execute trades.
      </p>

      <div className="bg-slate-900 rounded-2xl p-4 mt-4 border border-slate-800">
        <div className="text-slate-400 text-sm">
          Portfolio Value
        </div>

        <div className="text-2xl font-bold text-cyan-300">
          KES {Number(plan.totalValue || 0).toLocaleString()}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-950 rounded-xl p-3">
            <div className="text-xs text-slate-400">
              Risk
            </div>
            <div className="font-bold text-red-300">
              {plan.riskBefore}
            </div>
          </div>

          <div className="bg-slate-950 rounded-xl p-3">
            <div className="text-xs text-slate-400">
              Sectors
            </div>
            <div className="font-bold text-cyan-300">
              {sectorRows.length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
          <div className="text-xs text-slate-400">
            Diversification
          </div>
          <div className="font-bold text-cyan-300">
            {sectorRows.length >= 5
              ? "GOOD"
              : sectorRows.length >= 3
              ? "MODERATE"
              : "LOW"}
          </div>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4">
          <div className="text-xs text-slate-400">
            Largest Sector
          </div>
          <div className="font-bold text-purple-300">
            {largestSector?.sector || "N/A"}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mt-6 mb-4">
        Sector Heatmap
      </h2>

      <div className="
flex
gap-3
overflow-x-auto
pb-2
snap-x
">
        {sectorRows.map((sector) => {
          const exposurePct =
            Number(plan.totalValue || 0) > 0
              ? Number(
                  (
                    (Number(sector.totalValue || 0) /
                      Number(plan.totalValue || 1)) *
                    100
                  ).toFixed(2)
                )
              : 0;

          const sectorColor =
            exposurePct > 40
              ? "border-red-500/60 bg-red-500/10"
              : exposurePct > 20
              ? "border-yellow-500/60 bg-yellow-500/10"
              : "border-green-500/60 bg-green-500/10";

          const expanded =
            expandedSector === sector.sector;

          const avgTrend =
            sector.securities.length > 0
              ? Number(
                  (
                    Number(sector.totalTrend || 0) /
                    sector.securities.length
                  ).toFixed(2)
                )
              : 0;

          return (
            <div
              key={sector.sector}
              className={`min-w-[280px] snap-center rounded-2xl border overflow-hidden ${sectorColor}`}
            >
              <button
                onClick={() =>
                  setExpandedSector(
                    expanded ? null : sector.sector
                  )
                }
                className="w-full p-4 flex justify-between items-center text-left"
              >
                <div>
                  <div className="font-bold">
                    {sector.sector}
                  </div>

                  <div className="text-xs text-slate-400">
                    {sector.securities.length} securities • Trend{" "}
                    {avgTrend.toFixed(2)}%
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold">
                    {exposurePct}%
                  </div>
                  <div className="text-xs text-slate-400">
                    KES{" "}
                    {Number(sector.totalValue || 0).toLocaleString()}
                  </div>
                </div>
              </button>

              {expanded && (
                <div className="px-4 pb-4">
                  {sector.securities.map((security) => (
                    <div
                      key={security.symbol}
                      onClick={() =>
                        openExplanation(security.symbol)
                      }
                      className="bg-slate-950 rounded-xl p-3 mb-2 cursor-pointer active:scale-95 transition"
                    >
                      <div className="font-bold">
                        {security.symbol}
                      </div>

                      <div className="text-xs text-slate-400">
                        Value: KES{" "}
                        {Number(
                          security.value || 0
                        ).toLocaleString()}
                      </div>

                      <div className="text-xs text-slate-400">
                        Trend:{" "}
                        {Number(
                          security.changePct || 0
                        ).toFixed(2)}
                        %
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mt-5">
        <div className="font-bold text-yellow-300">
          Coach G Risk Alert
        </div>
        <p className="text-sm mt-2">
          Your portfolio may have concentration risk. Use simulation to test how new money can improve diversification without forcing a sale.
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

      {selectedExplanation && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50">
          <div className="bg-slate-950 border-t border-cyan-500/40 rounded-t-3xl p-5 w-full">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-cyan-300">
                Coach G Explanation
              </h2>

              <button
                onClick={() => setSelectedExplanation(null)}
                className="text-slate-400"
              >
                Close
              </button>
            </div>

            {loadingExplanation ? (
              <div className="text-slate-400 mt-4">
                Loading explanation...
              </div>
            ) : (
              <>
                <div className="mt-4 text-2xl font-bold">
                  {selectedExplanation.symbol}
                </div>

                <div className="text-sm text-slate-400">
                  {selectedExplanation.sector}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-slate-900 rounded-xl p-3">
                    <div className="text-xs text-slate-400">
                      Value
                    </div>
                    <div className="font-bold text-cyan-300">
                      KES{" "}
                      {Number(
                        selectedExplanation.marketValue || 0
                      ).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-3">
                    <div className="text-xs text-slate-400">
                      Trend
                    </div>
                    <div className="font-bold text-green-300">
                      {Number(
                        selectedExplanation.changePct || 0
                      ).toFixed(2)}
                      %
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-6 mt-4">
                  {selectedExplanation.explanation}
                </p>
              </>
            )}
          </div>
        </div>
      )}

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
<div className="mt-5">
  <label className="text-sm text-slate-400">
    Investment Goal
  </label>

  <select
    value={goal}
    onChange={(e) => {
      setGoal(e.target.value);
      setShowResults(false);
    }}
    className="mt-2 w-full bg-slate-900 border border-purple-500 rounded-xl p-3"
  >
    <option value="wealth_growth">Wealth Growth</option>
    <option value="dividend">Dividend Income</option>
    <option value="balanced_growth">Balanced Growth</option>
    <option value="preservation">Capital Preservation</option>
    <option value="custom">Custom Goal</option>
  </select>
</div>

                Scenario
              </label>

              <select
                className="mt-2 bg-slate-900 border border-purple-500 rounded-xl p-3 w-full"
                value={risk}
                onChange={(e)=>{

 setRisk(e.target.value);

 setShowResults(false);

}}
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
                onChange={(e) => {

 setAmount(e.target.value);

 setShowResults(false);

}}
                className="mt-2 bg-slate-900 border border-purple-500 rounded-xl p-3 w-full"
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
                onChange={(e)=>{

 setIntensity(e.target.value);

 setShowResults(false);

}}
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
                <h3 className="font-bold text-cyan-300">
                  Simulation Results
                </h3>

                <div className="
bg-purple-500/10
border
border-purple-500/20
rounded-xl
p-4
mt-4
">

<div className="text-xs text-slate-400">

Scenario Summary

</div>

<div className="mt-2">

Risk:

<span className="font-bold ml-2">

{risk}

</span>

</div>

<div>

Investment:

<span className="font-bold ml-2">

KES {Number(amount).toLocaleString()}

</span>

</div>

<div>

Intensity:

<span className="font-bold ml-2">

{intensity}%

</span>

</div>

</div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-slate-900 rounded-xl p-3">
                    <div className="text-xs text-slate-400">
                 <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mt-4">
  <div className="text-xs text-slate-400">
    Goal Strategy
  </div>

  <div className="font-bold text-purple-300 mt-1">
    {plan.investmentPlan.goalProfile?.label}
  </div>

  <p className="text-sm text-slate-300 mt-2">
    {plan.investmentPlan.goalProfile?.strategy}
  </p>
</div>
 
                      Projected Value
                    </div>

                    <div className="font-bold text-cyan-300">
                      KES{" "}
                      {Number(
                        plan.investmentPlan.projectedPortfolioValue ||
                          0
                      ).toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-xl p-3">
                    <div className="text-xs text-slate-400">
                      Risk Direction
                    </div>

                    <div className="font-bold text-green-300">
                      {plan.investmentPlan.riskDirection}
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-cyan-300 mt-5">
                  Projected Sector Exposure
                </h3>

                {plan.investmentPlan.targetPlan?.map((item) => (
                  <div
                    key={item.sector}
                    className="bg-slate-900 rounded-xl p-3 mt-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span>{item.sector}</span>
                      <span>
                        {item.currentWeight}% →{" "}
                        {item.projectedWeight}%
                      </span>
                    </div>
                  </div>
                ))}

                <h3 className="font-bold text-green-300 mt-5">
                  Buy Recommendations
                </h3>

                {plan.investmentPlan.recommendations?.map(
                  (item) => (
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
                        Allocate KES{" "}
                        {Number(
                          item.suggestedAmount || 0
                        ).toLocaleString()}
                      </div>

                      <div className="text-sm text-cyan-300">
                        Estimated Shares: {item.estimatedShares}
                      </div>
                    </div>
                  )
                )}

                <h3 className="font-bold text-red-300 mt-5">
                  Avoid / Do Not Add
                </h3>

                {plan.investmentPlan.blockedInvestments?.map(
                  (item) => (
                    <div
                      key={item.symbol}
                      className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mt-2"
                    >
                      <div className="font-bold text-red-300">
                        {item.symbol}
                      </div>

                      <div className="text-xs text-slate-400">
                        {item.reason}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}