import { useEffect, useState } from "react";
import MobileBuyingPowerBar from "./MobileBuyingPowerBar";
import MobileBottomNav from "../components/mobile/MobileBottomNav";
import { motion } from "framer-motion";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobilePortfolio() {
  const [portfolio, setPortfolio] = useState(null);

  async function loadPortfolio() {
    const res = await fetch(`${API_URL}/portfolio/unified`);
    const data = await res.json();

    if (data.ok) {
      setPortfolio(data.portfolio);
    }
  }

  useEffect(() => {
    loadPortfolio();

    const interval = setInterval(loadPortfolio, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25 }}
  className="bg-slate-950 min-h-screen text-white pb-24"
>
      <MobileBuyingPowerBar />

      <div className="p-4">
        <h1 className="text-3xl font-bold">
          My Portfolio
        </h1>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <Card
            title="Market Value"
            value={`KES ${Number(
              portfolio?.totalMarketValue || 0
            ).toLocaleString()}`}
          />

          <Card
            title="Total P&L"
            value={`KES ${Number(
              portfolio?.totalPnL || 0
            ).toLocaleString()}`}
            color={
              Number(portfolio?.totalPnL || 0) >= 0
                ? "text-green-400"
                : "text-red-400"
            }
          />
        </div>

        <h2 className="text-xl font-bold mt-6 mb-3">
          Holdings
        </h2>

        <div className="space-y-3">
          {(portfolio?.holdings || []).map((item) => (
            <div
              key={`${item.broker}-${item.symbol}`}
              className="bg-slate-900 rounded-2xl p-4"
            >
              <div className="flex justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {item.symbol}
                  </div>

                  <div className="text-slate-400 text-sm">
                    {item.quantity} shares • {item.broker}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-cyan-400 font-bold">
                    KES {Number(item.marketValue || 0).toLocaleString()}
                  </div>

                  <div
                    className={
                      Number(item.unrealizedPnL || 0) >= 0
                        ? "text-green-400 text-sm"
                        : "text-red-400 text-sm"
                    }
                  >
                    KES {Number(item.unrealizedPnL || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <a
                  href={`/mobile/order/${item.symbol}/BUY`}
                  className="text-center bg-green-600 rounded-xl py-3 font-bold"
                >
                  Buy More
                </a>

                <a
                  href={`/mobile/order/${item.symbol}/SELL`}
                  className="text-center bg-red-600 rounded-xl py-3 font-bold"
                >
                  Sell
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500 rounded-2xl p-4 mt-6">
          <div className="text-cyan-400 font-bold">
            Coach G Portfolio Advice
          </div>

          <p className="text-sm text-slate-300 mt-2">
            Review concentration risk and avoid overexposure to one symbol before placing more orders.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Card({ title, value, color = "text-white" }) {
  return (
    <div className="bg-slate-900 rounded-2xl p-4">
      <div className="text-xs text-slate-400">
        {title}
      </div>

      <div className={`text-xl font-bold mt-2 ${color}`}>
        {value}

           </div>

      <MobileBottomNav />
    </div>
  );
}