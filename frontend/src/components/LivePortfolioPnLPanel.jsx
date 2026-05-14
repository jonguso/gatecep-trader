import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function LivePortfolioPnLPanel() {
  const [portfolio, setPortfolio] = useState(null);
  const [flash, setFlash] = useState(false);

  async function loadPortfolio() {
    const res = await fetch(`${API_URL}/portfolio/unified`);
    const data = await res.json();

    if (data.ok) {
      setPortfolio(data.portfolio);
      setFlash(true);

      setTimeout(() => {
        setFlash(false);
      }, 600);
    }
  }

  useEffect(() => {
    loadPortfolio();

    const token =
      localStorage.getItem("gatecep_token");

    const socket = io(API_URL, {
      transports: ["websocket"],
      auth: {
        token
      }
    });

    socket.on("portfolio:update", () => {
      loadPortfolio();
    });

    return () => {
      socket.off("portfolio:update");
      socket.disconnect();
    };
  }, []);

  if (!portfolio) {
    return (
      <div className="bg-slate-900 rounded-2xl p-6 text-white">
        Loading live portfolio...
      </div>
    );
  }

  const pnlPositive =
    Number(portfolio.totalPnL || 0) >= 0;

  return (
    <div
      className={`rounded-2xl p-6 shadow-xl text-white border transition-all ${
        flash
          ? "bg-cyan-500/20 border-cyan-400"
          : "bg-slate-900 border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold">
            Live Portfolio P&L
          </h2>

          <p className="text-slate-400 text-sm">
            Real-time portfolio valuation and broker exposure
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500 text-cyan-300 text-sm">
          LIVE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">
            Market Value
          </div>

          <div className="text-2xl font-bold text-cyan-400">
            KES {portfolio.totalMarketValue}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">
            Total P&L
          </div>

          <div
            className={`text-2xl font-bold ${
              pnlPositive
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            KES {portfolio.totalPnL}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">
            Unrealized P&L
          </div>

          <div
            className={`text-2xl font-bold ${
              portfolio.totalUnrealizedPnL >= 0
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            KES {portfolio.totalUnrealizedPnL}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm">
            Holdings
          </div>

          <div className="text-2xl font-bold">
            {portfolio.holdingCount}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {portfolio.brokers.map((broker) => (
          <div
            key={broker.broker}
            className="bg-slate-800 rounded-xl p-4 border border-slate-700"
          >
            <div className="flex justify-between">
              <span className="font-bold">
                {broker.broker}
              </span>

              <span className="text-cyan-400 font-bold">
                KES {broker.marketValue}
              </span>
            </div>

            <div className="text-sm text-slate-400 mt-2">
              Holdings: {broker.holdings}
            </div>

            <div
              className={`text-sm mt-1 ${
                broker.unrealizedPnL >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              Unrealized P&L: KES {broker.unrealizedPnL}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}