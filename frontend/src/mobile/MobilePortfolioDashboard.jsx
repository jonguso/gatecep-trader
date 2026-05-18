import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function allocationPercent(value, total) {
  if (!total) return 0;

  return Math.round(
    (Number(value || 0) / Number(total || 1)) * 100
  );
}

export default function MobilePortfolioDashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [brokerFilter, setBrokerFilter] = useState("ALL");
  const [expandedSymbol, setExpandedSymbol] = useState(null);

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
      console.error("Failed to load portfolio dashboard:", error);
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

  const investedValue = filteredHoldings.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.averageCost || 0),
    0
  );

  const currentValue = filteredHoldings.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.marketPrice || 0),
    0
  );

  const unrealizedPnL =
    currentValue - investedValue;

  const largestHolding = [...filteredHoldings].sort(
    (a, b) =>
      Number(b.marketValue || 0) -
      Number(a.marketValue || 0)
  )[0];

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
        <Metric
          title="Current Value"
          value={currentValue}
          color="text-green-400"
        />

        <Metric
          title="Free Cash"
          value={freeCash}
          color="text-cyan-400"
        />

        <Metric
          title="Invested Value"
          value={investedValue}
        />

        <Metric
          title="Net Gain/Loss"
          value={unrealizedPnL}
          color={
            unrealizedPnL >= 0
              ? "text-green-400"
              : "text-red-400"
          }
        />
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800">
          <h2 className="font-bold text-lg">
            Holdings
          </h2>

          <select
            value={brokerFilter}
            onChange={(e) =>
              setBrokerFilter(e.target.value)
            }
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs"
          >
            {brokers.map((broker) => (
              <option key={broker} value={broker}>
                {broker === "ALL"
                  ? "All Brokers"
                  : broker}
              </option>
            ))}
          </select>
        </div>

        <div className="divide-y divide-slate-800">
          <div className="grid grid-cols-4 gap-3 px-4 py-3 border-b border-slate-800 bg-slate-950">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
                Security
              </span>

              <span className="text-[10px] text-slate-500 mt-1">
                Quantity
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
                Avg. Price
              </span>

              <span className="text-[10px] text-slate-500 mt-1">
                Inv. Value
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
                LTP
              </span>

              <span className="text-[10px] text-slate-500 mt-1">
                Current Value
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
                P&amp;L Value
              </span>

              <span className="text-[10px] text-slate-500 mt-1">
                P&amp;L %
              </span>
            </div>
          </div>

          {filteredHoldings.map((item) => {
            const pnl = Number(item.unrealizedPnL || 0);

            const positiveMove =
              Number(item.marketPrice || 0) >=
              Number(item.averageCost || 0);

            const pnlColor =
              pnl >= 0
                ? "text-green-400"
                : "text-red-400";

            const invested =
              Number(item.quantity || 0) *
              Number(item.averageCost || 0);

            const current =
              Number(item.quantity || 0) *
              Number(item.marketPrice || 0);

            return (
              <div
                key={`${item.broker}-${item.symbol}`}
                onClick={() =>
                  setExpandedSymbol(
                    expandedSymbol === item.symbol
                      ? null
                      : item.symbol
                  )
                }
                className={`px-4 py-5 transition-all duration-500 cursor-pointer hover:bg-slate-800/60 ${
                  positiveMove
                    ? "hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]"
                    : "hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]"
                }`}
              >
                <div className="grid grid-cols-4 gap-3 items-center">
                  <div className="flex flex-col">
                    <div className="font-bold text-cyan-400">
                      {item.symbol}
                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      Qty{" "}
                      {Number(
                        item.quantity || 0
                      ).toLocaleString()}
                    </div>

                    <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-1.5 bg-cyan-400 rounded-full"
                        style={{
                          width: `${allocationPercent(
                            item.marketValue,
                            currentValue
                          )}%`
                        }}
                      />
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1">
                      {allocationPercent(
                        item.marketValue,
                        currentValue
                      )}
                      % allocation
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="font-bold text-white">
                      {Number(
                        item.averageCost || 0
                      ).toFixed(2)}
                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      {invested.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-center">
                    <div
                      className={`font-bold ${
                        positiveMove
                          ? "text-green-400 animate-pulse"
                          : "text-red-400 animate-pulse"
                      }`}
                    >
                      {Number(
                        item.marketPrice || 0
                      ).toFixed(2)}
                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      {current.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-bold ${pnlColor}`}>
                      {pnl >= 0 ? "+" : ""}
                      {Math.round(pnl).toLocaleString()}
                    </div>

                    <div className={`text-xs mt-1 ${pnlColor}`}>
                      {Number(
                        item.unrealizedPnLPercent || 0
                      ).toFixed(2)}
                      %
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <a
                    href={`/mobile/order/${item.symbol}/BUY`}
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    className="flex-1 text-center bg-green-600 hover:bg-green-500 rounded-lg py-2 text-xs font-bold"
                  >
                    BUY
                  </a>

                  <a
                    href={`/mobile/order/${item.symbol}/SELL`}
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    className="flex-1 text-center bg-red-600 hover:bg-red-500 rounded-lg py-2 text-xs font-bold"
                  >
                    SELL
                  </a>

                  <a
                    href={`/mobile/stock/${item.symbol}`}
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                    className="flex-1 text-center bg-slate-800 hover:bg-slate-700 rounded-lg py-2 text-xs font-bold text-cyan-300"
                  >
                    VIEW
                  </a>
                </div>

                {expandedSymbol === item.symbol && (
                  <div className="mt-4 bg-slate-800 rounded-xl p-3 border border-slate-700">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <Detail
                        title="Broker"
                        value={item.broker}
                        color="text-cyan-300"
                      />

                      <Detail
                        title="Sector"
                        value={item.sector || "Unknown"}
                      />

                      <Detail
                        title="Market Value"
                        value={`KES ${Number(
                          item.marketValue || 0
                        ).toLocaleString()}`}
                        color="text-green-400"
                      />

                      <Detail
                        title="Realized P&L"
                        value={`KES ${Number(
                          item.realizedPnL || 0
                        ).toLocaleString()}`}
                        color="text-yellow-300"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredHoldings.length === 0 && (
            <div className="p-6 text-center text-slate-400">
              No holdings available.
            </div>
          )}
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

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            Portfolio Insights
          </h2>

          <div className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
            LIVE AI
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Insight
            title="Largest Position"
            value={largestHolding?.symbol || "-"}
            color="text-cyan-300"
          />

          <Insight
            title="Portfolio Trend"
            value={unrealizedPnL >= 0 ? "Positive" : "Negative"}
            color={
              unrealizedPnL >= 0
                ? "text-green-400"
                : "text-red-400"
            }
          />

          <Insight
            title="Diversification"
            value={`${filteredHoldings.length} Holdings`}
            color="text-yellow-300"
          />

          <Insight
            title="AI Risk Level"
            value={
              filteredHoldings.length < 4
                ? "Moderate"
                : "Balanced"
            }
            color="text-cyan-300"
          />
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

function Detail({
  title,
  value,
  color = "text-white"
}) {
  return (
    <div>
      <div className="text-slate-400">
        {title}
      </div>

      <div className={`font-bold ${color}`}>
        {value}
      </div>
    </div>
  );
}

function Insight({
  title,
  value,
  color = "text-white"
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-3">
      <div className="text-xs text-slate-400">
        {title}
      </div>

      <div className={`text-lg font-bold mt-1 ${color}`}>
        {value}
      </div>
    </div>
  );
}