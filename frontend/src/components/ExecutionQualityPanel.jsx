import { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function gradeColor(grade) {
  if (grade === "A") return "text-green-400 border-green-500";
  if (grade === "B") return "text-cyan-400 border-cyan-500";
  if (grade === "C") return "text-yellow-400 border-yellow-500";
  if (grade === "D") return "text-orange-400 border-orange-500";
  return "text-red-400 border-red-500";
}

export default function ExecutionQualityPanel() {
  const [quality, setQuality] = useState([]);

  async function loadQuality() {
    const res = await fetch(`${API_URL}/execution-quality`);
    const data = await res.json();

    if (data.ok) {
      setQuality((data.quality || []).slice(0, 12));
    }
  }

  useEffect(() => {
    loadQuality();

    const interval = setInterval(loadQuality, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-1">
        Execution Quality Score
      </h2>

      <p className="text-slate-400 text-sm mb-5">
        Slippage, fill rate, broker quality and final execution grade
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th className="text-left py-2">Order</th>
              <th className="text-left py-2">Symbol</th>
              <th className="text-left py-2">Broker</th>
              <th className="text-right py-2">Score</th>
              <th className="text-center py-2">Grade</th>
              <th className="text-right py-2">Fill Rate</th>
              <th className="text-right py-2">Slippage</th>
              <th className="text-right py-2">Avg Price</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {quality.map((item) => (
              <tr
                key={item.orderId}
                className="border-b border-slate-800 hover:bg-slate-800/60"
              >
                <td className="py-3 text-slate-400">
                  {item.orderId}
                </td>

                <td className="py-3 font-bold">
                  {item.symbol}
                </td>

                <td className="py-3 text-cyan-400">
                  {item.broker}
                </td>

                <td className="py-3 text-right font-bold">
                  {item.score}
                </td>

                <td className="py-3 text-center">
                  <span
                    className={`px-3 py-1 rounded-full border font-bold ${gradeColor(
                      item.grade
                    )}`}
                  >
                    {item.grade}
                  </span>
                </td>

                <td className="py-3 text-right">
                  {item.fillRate}%
                </td>

                <td
                  className={`py-3 text-right ${
                    item.slippagePct <= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {item.slippagePct}%
                </td>

                <td className="py-3 text-right">
                  KES {item.averageFillPrice}
                </td>

                <td className="py-3">
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}