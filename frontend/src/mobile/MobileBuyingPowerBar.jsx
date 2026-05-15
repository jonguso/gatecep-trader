import { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileBuyingPowerBar() {
  const [portfolio, setPortfolio] = useState(null);
  const [wallet, setWallet] = useState(null);

  async function loadData() {
    try {
      const [portfolioRes, walletRes] = await Promise.all([
        fetch(`${API_URL}/portfolio/unified`),
        fetch(`${API_URL}/wallet/balance`)
      ]);

      const portfolioData = await portfolioRes.json();
      const walletData = await walletRes.json();

      if (portfolioData.ok) {
        setPortfolio(portfolioData.portfolio);
      }

      if (walletData.ok) {
        setWallet(walletData.wallet);
      }
    } catch (error) {
      console.error(
        "Failed to load buying power:",
        error
      );
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 5000);

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
              wallet?.balance ||
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