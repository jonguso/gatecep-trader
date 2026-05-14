import { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function scoreColor(score) {
  if (score >= 85) return "text-green-400 border-green-500";
  if (score >= 70) return "text-yellow-400 border-yellow-500";
  return "text-red-400 border-red-500";
}

export default function SmartBrokerScorePanel() {
  const [scores, setScores] = useState([]);
  const [bestBroker, setBestBroker] = useState(null);

  async function loadScores() {
    try {
      const [scoresRes, bestRes] = await Promise.all([
        fetch(`${API_URL}/smart-broker/scores`),
        fetch(`${API_URL}/smart-broker/best`)
      ]);

      const scoresData = await scoresRes.json();
      const bestData = await bestRes.json();

      if (scoresData.ok) {
        setScores(scoresData.scores || []);
      }

      if (bestData.ok) {
        setBestBroker(bestData.broker);
      }
    } catch (error) {
      console.error("Failed to load smart broker scores:", error);
    }
  }

  useEffect(() => {
    loadScores();

    const interval = setInterval(loadScores, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold">
            Smart Broker Scoring
          </h2>

          <p className="text-slate-400 text-sm">
            Dynamic broker ranking using fill rate, latency, uptime, liquidity, and rejection risk
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500 text-cyan-300">
          Best: {bestBroker || "Loading..."}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scores.map((item) => (
          <div
            key={item.broker}
            className={`bg-slate-800 rounded-2xl p-5 border ${scoreColor(
              item.score
            )}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-slate-400">
                  Broker
                </div>

                <div className="text-3xl font-bold">
                  {item.broker}
                </div>
              </div>

              {item.broker === bestBroker && (
                <div className="text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500">
                  BEST
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="text-sm text-slate-400">
                Execution Score
              </div>

              <div className="text-4xl font-bold">
                {item.score}
              </div>

              <div className="h-2 bg-slate-700 rounded-full mt-3">
                <div
                  className="h-2 bg-cyan-400 rounded-full"
                  style={{
                    width: `${Math.min(item.score, 100)}%`
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-slate-400">Fill Rate</div>
                <div className="font-bold text-green-400">
                  {item.fillRate}%
                </div>
              </div>

              <div>
                <div className="text-slate-400">Reject Rate</div>
                <div className="font-bold text-red-400">
                  {item.rejectionRate}%
                </div>
              </div>

              <div>
                <div className="text-slate-400">Latency</div>
                <div className="font-bold">
                  {item.latencyMs} ms
                </div>
              </div>

              <div>
                <div className="text-slate-400">Uptime</div>
                <div className="font-bold text-cyan-400">
                  {item.uptime}%
                </div>
              </div>

              <div>
                <div className="text-slate-400">Liquidity</div>
                <div className="font-bold text-purple-400">
                  {item.liquidityScore}
                </div>
              </div>

              <div>
                <div className="text-slate-400">Latency Score</div>
                <div className="font-bold">
                  {item.latencyScore}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}