import React, { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function ExecutionAdvisorPanel() {
  const [symbol, setSymbol] = useState("SCOM");
  const [advice, setAdvice] = useState(null);

  async function loadAdvice() {
    const res = await fetch(`${API_URL}/execution-advisor/${symbol}`);
    const data = await res.json();

    if (data.ok) {
      setAdvice(data.advice);
    }
  }

  useEffect(() => {
    loadAdvice();

    const interval = setInterval(loadAdvice, 3000);

    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">
          Coach G Execution AI
        </h2>

        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="bg-slate-800 rounded-xl p-2 text-white"
        >
          <option value="SCOM">SCOM</option>
          <option value="EQTY">EQTY</option>
          <option value="KCB">KCB</option>
          <option value="COOP">COOP</option>
        </select>
      </div>

      {advice && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">
                Recommendation
              </div>
              <div className="text-2xl font-bold text-cyan-400">
                {advice.recommendation}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">
                Confidence
              </div>
              <div className="text-2xl font-bold text-green-400">
                {advice.confidenceScore}%
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">
                Recommended Broker
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {advice.recommendedBroker}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">
                Market Impact
              </div>
              <div className="text-2xl font-bold text-yellow-400">
                {advice.marketImpact}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">
                Spread Risk
              </div>
              <div className="font-bold">
                {advice.spreadRisk}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">
                Liquidity Risk
              </div>
              <div className="font-bold">
                {advice.liquidityRisk}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-sm text-slate-400">
                Liquidity Score
              </div>
              <div className="font-bold">
                {advice.liquidityScore}/100
              </div>
            </div>
          </div>

          <div className="mt-5 bg-slate-800 rounded-xl p-4 border border-cyan-500">
            <div className="text-cyan-400 font-bold mb-2">
              Coach G Summary
            </div>

            <div className="text-slate-200 text-sm">
              Best bid is KES {advice.bestBid}, best ask is KES{" "}
              {advice.bestAsk}, spread is KES {advice.spread}.
              Current recommendation is{" "}
              <span className="font-bold text-cyan-400">
                {advice.recommendation}
              </span>{" "}
              with {advice.confidenceScore}% confidence.
            </div>
          </div>
        </>
      )}
    </div>
  );
}