import { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileBuyingPowerBar() {
  const [portfolio, setPortfolio] = useState(null);

  async function loadPortfolio() {
    try {
      const res = await fetch(`${API_URL}/portfolio/unified`);
      const data = await res.json();

      if (data.ok) {
        setPortfolio(data.portfolio);
      }
    } catch (error) {
      console.error("Failed to load buying power:", error);
    }
  }

  useEffect(() => {
    loadPortfolio();

    const interval = setInterval(loadPortfolio, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sticky top-0 z-40 bg-slate-950 border-b border-slate-800 px-4 py-3">
      <div className="bg-slate-900 rounded-2xl p-4 shadow-xl text-white flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400">
            Available Funds
          </div>

          <div className="text-xl font-bold text-green-400">
            KES{" "}
            {Number(
              portfolio?.buyingPower ||
                portfolio?.availableFunds ||
                0
            ).toLocaleString()}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">
            Portfolio Value
          </div>

          <div className="text-lg font-bold text-cyan-400">
            KES{" "}
            {Number(
              portfolio?.totalMarketValue || 0
            ).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}