import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";


export default function MobilePortfolioDashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [brokerFilter, setBrokerFilter] = useState("ALL");

  async function loadData() {
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
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 5000);

    return () => clearInterval(interval);
  }, []);

  const brokers = useMemo(() => {
    const values = (portfolio?.holdings || []).map(
      (item) => item.broker
    );

    return ["ALL", ...new Set(values)];
  }, [portfolio]);

  const filteredHoldings = useMemo(() => {
    if (brokerFilter === "ALL") {
      return portfolio?.holdings || [];
    }

    return (portfolio?.holdings || []).filter(
      (item) => item.broker === brokerFilter
    );
  }, [portfolio, brokerFilter]);

  const freeCash = Number(wallet?.balance || 0);
  const portfolioValue = Number(portfolio?.totalMarketValue || 0);
  const netWorth = freeCash + portfolioValue;
  const unrealizedPnL = Number(portfolio?.totalUnrealizedPnL || 0);

  if (!portfolio) {
    return (
      <div className="bg-slate-900 rounded-2xl p-6 text-white">
        Loading portfolio...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-3">
        <Metric title="Portfolio Value" value={portfolioValue} color="text-green-400" />
        <Metric title="Free Cash" value={freeCash} color="text-cyan-400" />
        <Metric title="Net Worth" value={netWorth} />
        <Metric
           title="Unrealized P&L"
           value={unrealizedPnL}
           color={unrealizedPnL >= 0 ? "text-green-400" : "text-red-400"}
       />
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800">
          <h2 className="font-bold text-lg">
            Holdings
          </h2>

          <select
            value={brokerFilter}
            onChange={(e) => setBrokerFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs"
          >
            {brokers.map((broker) => (
              <option key={broker} value={broker}>
                {broker === "ALL" ? "All Brokers" : broker}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-9 gap-2 px-3 py-3 border-b border-slate-800 items-center text-sm hover:bg-slate-800/70 transition-colors">
              <div>S.No</div>
              <div>Symbol</div>
              <div>Name</div>
              <div>Qty</div>
              <div>Avg Cost</div>
              <div>Market Price</div>
              <div>Market Value</div>
              <div>P&amp;L</div>
              <div>Broker</div>
            </div>

            {filteredHoldings.map((item, index) => {
              const pnl = Number(item.unrealizedPnL || 0);
              const pnlColor =
                pnl >= 0 ? "text-green-400" : "text-red-400";
              const pnlSign = pnl >= 0 ? "+" : "";

              return (
                <a
                  key={`${item.broker}-${item.symbol}`}
                  href={`/mobile/stock/${item.symbol}`}
                  className="grid grid-cols-9 gap-2 px-3 py-3 border-b border-slate-800 items-center text-sm hover:bg-slate-800/70 transition-colors"
                >
                  <div className="text-slate-500">
                    {index + 1}
                  </div>

                 <div className="font-bold text-cyan-400 whitespace-nowrap">
  {item.symbol}
</div>

<div>
  <div className="text-slate-300 truncate">
    {item.name || item.symbol}
  </div>

  <div className="text-[10px] text-slate-500">
    {item.sector || "Unknown"}
  </div>
</div>

<div>
  {Number(item.quantity || 0).toLocaleString()}
</div> 

                  <div>
                    KES {Number(item.averageCost || 0).toLocaleString()}
                  </div>

                  <div>
                    KES {Number(item.marketPrice || 0).toLocaleString()}
                  </div>

                  <div className="font-bold text-cyan-300">
                    KES {Number(item.marketValue || 0).toLocaleString()}
                  </div>

                  <div className={pnlColor}>
                    <div className="font-bold">
                      {pnlSign}KES {Math.abs(pnl).toLocaleString()}
                    </div>

                    <div className="text-[10px]">
                      {pnlSign}
                      {Number(item.unrealizedPnLPercent || 0).toFixed(2)}%
                    </div>
                  </div>

                  <div>{item.broker}</div>
                </a>
              );
            })}

            {filteredHoldings.length > 0 && (
              <div className="grid grid-cols-9 gap-2 px-3 py-3 border-b border-slate-800 items-center text-sm hover:bg-slate-800/70 transition-colors">
                <div></div>
                <div>Total</div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>

                <div className="text-cyan-300">
                  KES {portfolioValue.toLocaleString()}
                </div>

                <div
                  className={
                    unrealizedPnL >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  KES {unrealizedPnL.toLocaleString()}
                </div>

                <div></div>
              </div>
            )}
          </div>
        </div>
      </div>

<div className="bg-cyan-500/10 border border-cyan-500 rounded-2xl p-4">
  <div className="text-cyan-400 font-bold">
    Coach G Portfolio Advice
  </div>

  <p className="text-sm text-slate-300 mt-2">
    Review concentration risk, free cash, and unrealized P&L before adding more exposure.
  </p>
</div>

      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <h2 className="text-lg font-bold">
          Portfolio Charts
        </h2>

        <p className="text-sm text-slate-400 mt-2">
          Next: allocation by security and allocation by industry.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="h-40 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
            Pie Chart: Security
          </div>

          <div className="h-40 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
            Pie Chart: Industry
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Metric({ title, value, color = "text-white" }) {
  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
      <div className="text-xs text-slate-400">
        {title}
      </div>

      <div className={`text-lg font-bold mt-2 ${color}`}>
        KES {Number(value || 0).toLocaleString()}
      </div>
    </div>
  );
}