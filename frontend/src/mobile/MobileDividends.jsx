import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

<a
  href="/mobile/dividends-ai"
  className="block bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-4 mt-5"
>
  <div className="text-cyan-300 font-bold">
    Open Dividend AI
  </div>

  <div className="text-sm text-slate-300 mt-1">
    View Coach G payout scores, dividend capture opportunities, and risk levels.
  </div>
</a>

function statusColor(status) {
  if (status === "ANNOUNCED") {
    return "text-green-400 bg-green-500/10";
  }

  if (status === "EXPECTED") {
    return "text-yellow-300 bg-yellow-500/10";
  }

  return "text-cyan-300 bg-cyan-500/10";
}

export default function MobileDividends() {
  const [dividends, setDividends] = useState([]);

  async function loadDividends() {
    try {
      const res = await fetch(
        `${API_URL}/dividends`
      );

      const data = await res.json();

      if (data.ok) {
        setDividends(data.dividends || []);
      }
    } catch (error) {
      console.error(
        "Failed to load dividends:",
        error
      );
    }
  }

  useEffect(() => {
    loadDividends();

    const interval = setInterval(
      loadDividends,
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
        <h1 className="text-3xl font-bold">
          Dividend Calendar
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Upcoming NSE dividends and books closure alerts.
        </p>

        <div className="space-y-4 mt-5">
          {dividends.map((item) => (
            <div
              key={`${item.symbol}-${item.paymentDate}`}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">
                      {item.symbol}
                    </div>

                    <div
                      className={`text-[10px] px-2 py-1 rounded-full font-bold ${statusColor(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </div>
                  </div>

                  <div className="text-sm text-slate-400 mt-1">
                    {item.company}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">
                    Dividend
                  </div>

                  <div className="text-2xl font-bold text-cyan-300">
                    {item.currency}{" "}
                    {Number(
                      item.dividend || 0
                    ).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-xs text-slate-400">
                    Books Closure
                  </div>

                  <div className="font-bold mt-1">
                    {item.booksClosureDate}
                  </div>

                  <div className="text-yellow-300 text-xs mt-2">
                    {item.daysToBooksClosure} days left
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-3">
                  <div className="text-xs text-slate-400">
                    Payment Date
                  </div>

                  <div className="font-bold mt-1">
                    {item.paymentDate}
                  </div>

                  <div className="text-cyan-300 text-xs mt-2">
                    {item.daysToPayment} days left
                  </div>
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 mt-4">
                <div className="text-cyan-400 font-bold">
                  Coach G Insight
                </div>

                <div className="text-sm text-slate-300 mt-2 leading-6">
                  {item.status === "ANNOUNCED"
                    ? `${item.symbol} dividend officially announced. Monitor books closure timeline and potential dividend capture activity.`
                    : `${item.symbol} dividend expected based on historical payout behavior and earnings outlook.`}
                </div>
              </div>
            </div>
          ))}

          {dividends.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
              No dividend events available.
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}