import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function gradeColor(grade) {
  if (grade === "A") {
    return "bg-green-500/20 text-green-400";
  }

  if (grade === "B") {
    return "bg-cyan-500/20 text-cyan-300";
  }

  if (grade === "C") {
    return "bg-yellow-500/20 text-yellow-300";
  }

  if (grade === "D") {
    return "bg-orange-500/20 text-orange-300";
  }

  return "bg-red-500/20 text-red-400";
}

function behaviorColor(tag) {
  if (tag === "DISCIPLINED") {
    return "text-green-400";
  }

  if (tag === "FOMO_CHASING") {
    return "text-red-400";
  }

  if (tag === "EMOTIONAL_FEAR") {
    return "text-yellow-300";
  }

  return "text-cyan-300";
}

export default function MobileTradeJournal() {
  const [journal, setJournal] = useState([]);

  async function loadJournal() {
    try {
      const res = await fetch(
        `${API_URL}/trade-journal`
      );

      const data = await res.json();

      if (data.ok) {
        setJournal(data.journal || []);
      }
    } catch (error) {
      console.error(
        "Failed to load trade journal:",
        error
      );
    }
  }

  useEffect(() => {
    loadJournal();

    const interval = setInterval(
      loadJournal,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <div className="p-4">
<div className="flex justify-between items-start mb-4">
  <div>
    <h1 className="text-3xl font-bold">
      AI Trade Journal
    </h1>

    <p className="text-slate-400 text-sm mt-2">
      Coach G execution review, trade behavior, and performance analytics.
    </p>
  </div>

  <a
    href="/mobile/portfolio"
    className="bg-slate-800 hover:bg-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-cyan-300"
  >
    ✕ Close
  </a>
</div>
        <div className="space-y-4 mt-5">
          {journal.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">
                      {item.symbol}
                    </div>

                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold ${gradeColor(
                        item.tradeGrade
                      )}`}
                    >
                      Grade {item.tradeGrade}
                    </div>
                  </div>

                  <div className="text-sm text-slate-400 mt-1">
                    {item.side} • {item.broker}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">
                    AI Confidence
                  </div>

                  <div className="text-xl font-bold text-cyan-300">
                    {item.aiConfidence}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <Metric
                  label="Entry Price"
                  value={`KES ${item.entryPrice}`}
                  color="text-cyan-300"
                />

                <Metric
                  label="Current Price"
                  value={`KES ${item.currentPrice}`}
                  color="text-cyan-300"
                />

                <Metric
                  label="P&L"
                  value={`${
                    Number(item.pnl || 0) >= 0
                      ? "+"
                      : ""
                  }KES ${Math.round(
                    item.pnl || 0
                  ).toLocaleString()}`}
                  color={
                    Number(item.pnl || 0) >= 0
                      ? "text-green-300"
                      : "text-red-300"
                  }
                />

                <Metric
                  label="Return"
                  value={`${
                    Number(item.pnlPercent || 0) >= 0
                      ? "+"
                      : ""
                  }${Number(item.pnlPercent || 0).toFixed(
                    2
                  )}%`}
                  color={
                    Number(item.pnlPercent || 0) >= 0
                      ? "text-green-300"
                      : "text-red-300"
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-xs text-slate-400">
                    Holding Days
                  </div>

                  <div className="text-xl font-bold text-cyan-300 mt-1">
                    {item.holdingDays}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-xs text-slate-400">
                    Behavior
                  </div>

                  <div
                    className={`text-sm font-bold mt-2 ${behaviorColor(
                      item.behaviorTag
                    )}`}
                  >
                    {item.behaviorTag.replaceAll(
                      "_",
                      " "
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4 mt-4">
                <div className="text-xs text-slate-400">
                  Trade Reason
                </div>

                <div className="text-sm text-slate-200 mt-2">
                  {item.reason || "No notes"}
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 mt-4">
                <div className="text-cyan-300 font-bold">
                  Coach G Review
                </div>

                <div className="text-sm text-slate-300 mt-2 leading-6">
                  {item.coachGReview}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 mt-4">
                {new Date(
                  item.createdAt
                ).toLocaleString()}
              </div>
            </div>
          ))}

          {journal.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
              No journal entries yet.
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

      <div className={`text-lg font-bold mt-1 ${color}`}>
        {value}
      </div>
    </div>
  );
}