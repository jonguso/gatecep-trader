import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function phaseColor(phase) {
  if (phase === "LEADING") {
    return "bg-green-500/20 text-green-400";
  }

  if (phase === "IMPROVING") {
    return "bg-cyan-500/20 text-cyan-300";
  }

  if (phase === "WEAKENING") {
    return "bg-yellow-500/20 text-yellow-300";
  }

  return "bg-red-500/20 text-red-400";
}

export default function MobileSectorRotation() {
  const [analysis, setAnalysis] = useState(null);

  async function loadRotation() {
    try {
      const res = await fetch(
        `${API_URL}/sector-rotation-ai`
      );

      const data = await res.json();

      if (data.ok) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error(
        "Failed to load sector rotation:",
        error
      );
    }
  }

  useEffect(() => {
    loadRotation();

    const interval = setInterval(
      loadRotation,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  const sectors = analysis?.sectors || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold">
          Sector Rotation AI
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Coach G sector momentum, breadth, and liquidity analysis.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="bg-green-500/10 border border-green-500/40 rounded-2xl p-4">
            <div className="text-xs text-slate-400">
              Leading Sector
            </div>

            <div className="text-xl font-bold text-green-400 mt-2">
              {analysis?.leader?.sector || "-"}
            </div>

            <div className="text-sm text-slate-300 mt-2">
              Score {analysis?.leader?.rotationScore || 0}
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4">
            <div className="text-xs text-slate-400">
              Weakest Sector
            </div>

            <div className="text-xl font-bold text-red-400 mt-2">
              {analysis?.laggard?.sector || "-"}
            </div>

            <div className="text-sm text-slate-300 mt-2">
              Score {analysis?.laggard?.rotationScore || 0}
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-5">
          {sectors.map((item) => (
            <div
              key={item.sector}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-2xl font-bold">
                    {item.sector}
                  </div>

                  <div className="text-sm text-slate-400 mt-1">
                    {item.count} NSE securities
                  </div>
                </div>

                <div
                  className={`text-[10px] px-3 py-2 rounded-full font-bold ${phaseColor(
                    item.phase
                  )}`}
                >
                  {item.phase}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <Metric
                  label="Rotation Score"
                  value={item.rotationScore}
                  color="text-cyan-300"
                />

                <Metric
                  label="Avg Change"
                  value={`${item.averageChangePct}%`}
                  color={
                    item.averageChangePct >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                />

                <Metric
                  label="Gainers"
                  value={item.gainers}
                  color="text-green-400"
                />

                <Metric
                  label="Losers"
                  value={item.losers}
                  color="text-red-400"
                />
              </div>

              <div className="bg-slate-800 rounded-2xl p-4 mt-4">
                <div className="text-xs text-slate-400">
                  Sector Turnover
                </div>

                <div className="text-xl font-bold text-cyan-300 mt-1">
                  KES{" "}
                  {Number(
                    item.totalTurnover || 0
                  ).toLocaleString()}
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 mt-4">
                <div className="text-cyan-300 font-bold">
                  Coach G Insight
                </div>

                <div className="text-sm text-slate-300 mt-2 leading-6">
                  {item.coachGInsight}
                </div>
              </div>
            </div>
          ))}

          {sectors.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
              No sector rotation data available.
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="bg-slate-800 rounded-xl p-3">
      <div className="text-xs text-slate-400">
        {label}
      </div>

      <div className={`text-xl font-bold mt-1 ${color}`}>
        {value}
      </div>
    </div>
  );
}