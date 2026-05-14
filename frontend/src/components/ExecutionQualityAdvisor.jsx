import { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function ExecutionQualityAdvisor() {
  const [summary, setSummary] = useState(null);

  async function loadQuality() {
    const res = await fetch(
      `${API_URL}/execution-quality`
    );

    const data = await res.json();

    if (!data.ok) {
      return;
    }

    const quality = data.quality || [];

    if (quality.length === 0) {
      return;
    }

    const latest = quality[0];

    const avgScore =
      quality.reduce(
        (sum, item) => sum + Number(item.score || 0),
        0
      ) / quality.length;

    const rejected = quality.filter(
      (item) => item.status === "REJECTED"
    ).length;

    const avgSlippage =
      quality.reduce(
        (sum, item) =>
          sum + Number(item.slippagePct || 0),
        0
      ) / quality.length;

    let recommendation = "Execution quality stable.";

    if (avgScore >= 90) {
      recommendation =
        "Institutional execution quality is excellent.";
    } else if (avgScore >= 70) {
      recommendation =
        "Execution quality acceptable but can improve.";
    } else {
      recommendation =
        "Execution quality risk detected.";
    }

    if (rejected >= 3) {
      recommendation +=
        " High rejection rate detected.";
    }

    if (avgSlippage > 0.5) {
      recommendation +=
        " Positive slippage risk increasing.";
    }

    setSummary({
      latest,
      avgScore: avgScore.toFixed(2),
      rejected,
      avgSlippage: avgSlippage.toFixed(4),
      recommendation
    });
  }

  useEffect(() => {
    loadQuality();

    const interval = setInterval(loadQuality, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!summary) {
    return null;
  }

  function scoreColor(score) {
    if (score >= 90) return "text-green-400";
    if (score >= 70) return "text-cyan-400";
    if (score >= 50) return "text-yellow-400";

    return "text-red-400";
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold">
            Coach G Execution Quality AI
          </h2>

          <p className="text-slate-400 text-sm">
            AI analysis of broker execution performance
          </p>
        </div>

        <div className="px-3 py-1 rounded-full border border-green-500 text-green-400 text-xs font-bold">
          LIVE AI
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">
            Average Score
          </div>

          <div
            className={`text-3xl font-bold ${scoreColor(
              Number(summary.avgScore)
            )}`}
          >
            {summary.avgScore}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">
            Latest Grade
          </div>

          <div className="text-3xl font-bold text-cyan-400">
            {summary.latest.grade}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">
            Rejected Orders
          </div>

          <div className="text-3xl font-bold text-red-400">
            {summary.rejected}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">
            Avg Slippage
          </div>

          <div className="text-3xl font-bold text-yellow-400">
            {summary.avgSlippage}%
          </div>
        </div>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500 rounded-2xl p-5">
        <div className="text-cyan-400 font-bold mb-2">
          Coach G Summary
        </div>

        <div className="text-slate-200 leading-7">
          {summary.recommendation}
        </div>

        <div className="mt-4 text-sm text-slate-400">
          Latest execution:
          <span className="text-white ml-2">
            {summary.latest.symbol}
          </span>

          <span className="ml-4">
            Broker:
            <span className="text-cyan-400 ml-1">
              {summary.latest.broker}
            </span>
          </span>

          <span className="ml-4">
            Fill Rate:
            <span className="text-green-400 ml-1">
              {summary.latest.fillRate}%
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}