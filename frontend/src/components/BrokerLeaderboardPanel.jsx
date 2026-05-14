import { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function BrokerLeaderboardPanel() {
  const [scores, setScores] = useState([]);

  async function loadScores() {
    const res = await fetch(
      `${API_URL}/smart-broker/scores`
    );

    const data = await res.json();

    if (data.ok) {
      setScores(data.scores || []);
    }
  }

  useEffect(() => {
    loadScores();

    const interval = setInterval(loadScores, 5000);

    return () => clearInterval(interval);
  }, []);

  function scoreColor(score) {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-cyan-400";
    if (score >= 50) return "text-yellow-400";

    return "text-red-400";
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold">
            Smart Broker Leaderboard
          </h2>

          <p className="text-slate-400 text-sm">
            Real-time broker execution intelligence
          </p>
        </div>

        <div className="px-3 py-1 rounded-full border border-green-500 text-green-400 text-xs font-bold">
          LIVE
        </div>
      </div>

      <div className="space-y-4">
        {scores.map((broker, index) => (
          <div
            key={broker.broker}
            className="bg-slate-800 rounded-2xl p-4 border border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0
                      ? "bg-green-500/20 text-green-400"
                      : index === 1
                      ? "bg-cyan-500/20 text-cyan-400"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  #{index + 1}
                </div>

                <div>
                  <div className="font-bold text-lg">
                    {broker.broker}
                  </div>

                  <div className="text-xs text-slate-400">
                    Fill Rate {broker.fillRate}% •
                    Rejection {broker.rejectionRate}%
                  </div>
                </div>
              </div>

              <div
                className={`text-3xl font-bold ${scoreColor(
                  broker.score
                )}`}
              >
                {broker.score}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              <div className="bg-slate-900 rounded-xl p-3">
                <div className="text-xs text-slate-400">
                  Latency
                </div>

                <div className="text-lg font-bold text-cyan-400">
                  {broker.latencyMs} ms
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-3">
                <div className="text-xs text-slate-400">
                  Uptime
                </div>

                <div className="text-lg font-bold text-green-400">
                  {broker.uptime}%
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-3">
                <div className="text-xs text-slate-400">
                  Liquidity
                </div>

                <div className="text-lg font-bold text-yellow-400">
                  {broker.liquidityScore}
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-3">
                <div className="text-xs text-slate-400">
                  Latency Score
                </div>

                <div className="text-lg font-bold text-purple-400">
                  {broker.latencyScore}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}