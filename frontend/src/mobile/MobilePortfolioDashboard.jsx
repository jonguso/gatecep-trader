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

function PieChart({
  holdings,
  total,
  title = "Holdings Allocation"
}) {
  let offset = 0;

  const colors = [
    "#22d3ee",
    "#22c55e",
    "#eab308",
    "#a855f7",
    "#ef4444",
    "#3b82f6"
  ];

  const segments = holdings.map((item, index) => {
    const percent = allocationPercent(
      item.marketValue,
      total
    );

    const segment = {
      item,
      percent,
      color: colors[index % colors.length],
      dash: `${percent} ${100 - percent}`,
      offset
    };

    offset -= percent;

    return segment;
  });

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">
          {title}
        </h2>

        <span className="text-[10px] px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
          LIVE
        </span>
      </div>

      <div className="flex items-center gap-5 mt-4">
        <svg
          viewBox="0 0 36 36"
          className="w-32 h-32 rotate-[-90deg]"
        >
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="transparent"
            stroke="#1e293b"
            strokeWidth="4"
          />

          {segments.map((segment) => (
            <circle
              key={segment.item.symbol}
              cx="18"
              cy="18"
              r="15.915"
              fill="transparent"
              stroke={segment.color}
              strokeWidth="4"
              strokeDasharray={segment.dash}
              strokeDashoffset={segment.offset}
            />
          ))}
        </svg>

        <div className="flex-1 space-y-2">
          {segments.slice(0, 5).map((segment) => (
            <div
              key={segment.item.symbol}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: segment.color
                  }}
                />

                <span className="font-bold">
                  {segment.item.symbol}
                </span>
              </div>

              <span className="text-slate-300">
                {segment.percent}%
              </span>
            </div>
          ))}

          {segments.length === 0 && (
            <div className="text-sm text-slate-500">
              No allocation data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectorPieChart({ holdings, total }) {
  const sectorMap = new Map();

  holdings.forEach((item) => {
    const sector = item.sector || "Unknown";
    const value = Number(item.marketValue || 0);

    sectorMap.set(
      sector,
      (sectorMap.get(sector) || 0) + value
    );
  });

  const sectorHoldings = Array.from(
    sectorMap.entries()
  ).map(([sector, marketValue]) => ({
    symbol: sector,
    marketValue
  }));

  return (
    <PieChart
      holdings={sectorHoldings}
      total={total}
      title="Sector Allocation"
    />
  );
}

export default function MobilePortfolioDashboard() {
  const [portfolio, setPortfolio] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [brokerFilter, setBrokerFilter] = useState("ALL");
  const [expandedSymbol, setExpandedSymbol] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

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
        "Failed to load portfolio dashboard:",
        error
      );
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

  const groupedHoldings = useMemo(() => {
    const map = new Map();

    for (const item of filteredHoldings) {
      const symbol = String(item.symbol || "").trim();

      if (!map.has(symbol)) {
        map.set(symbol, {
          ...item,
          symbol,
          brokers: [item.broker],
          quantity: 0,
          totalCost: 0,
          marketValue: 0,
          unrealizedPnL: 0,
          realizedPnL: 0
        });
      }

      const current = map.get(symbol);

      const qty = Number(item.quantity || 0);
      const avg = Number(item.averageCost || 0);
      const cost = qty * avg;

      current.quantity += qty;
      current.totalCost += cost;
      current.marketValue += Number(item.marketValue || 0);
      current.unrealizedPnL += Number(item.unrealizedPnL || 0);
      current.realizedPnL += Number(item.realizedPnL || 0);

      if (!current.brokers.includes(item.broker)) {
        current.brokers.push(item.broker);
      }

      current.marketPrice = Number(
        item.marketPrice ||
          current.marketPrice ||
          0
      );

      current.averageCost =
        current.quantity > 0
          ? Number(
              (
                current.totalCost /
                current.quantity
              ).toFixed(2)
            )
          : 0;

      current.unrealizedPnLPercent =
        current.totalCost > 0
          ? Number(
              (
                (current.unrealizedPnL /
                  current.totalCost) *
                100
              ).toFixed(2)
            )
          : 0;
    }

    return Array.from(map.values());
  }, [filteredHoldings]);

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

  const largestHolding = [...groupedHoldings].sort(
    (a, b) =>
      Number(b.marketValue || 0) -
      Number(a.marketValue || 0)
  )[0];

  const concentrationRisk =
    largestHolding && currentValue > 0
      ? allocationPercent(
          largestHolding.marketValue,
          currentValue
        )
      : 0;

  const portfolioAdvice =
    concentrationRisk >= 70
      ? `High concentration detected. ${largestHolding.symbol} represents ${concentrationRisk}% of your portfolio. Consider diversifying.`
      : unrealizedPnL < 0
      ? "Portfolio is currently negative. Review losing positions before adding more exposure."
      : groupedHoldings.length < 4
      ? "Portfolio is profitable but diversification is limited. Consider adding more sectors."
      : "Portfolio structure looks balanced. Continue monitoring liquidity, risk, and allocation.";

  const diversificationScore =
    groupedHoldings.length >= 5
      ? 30
      : groupedHoldings.length >= 3
      ? 20
      : 10;

  const pnlScore =
    unrealizedPnL > 0 ? 35 : 15;

  const cashScore =
    freeCash > investedValue * 0.15 ? 20 : 10;

  const concentrationPenalty =
    concentrationRisk > 60 ? -20 : 0;

  const portfolioHealth = Math.max(
    0,
    Math.min(
      100,
      diversificationScore +
        pnlScore +
        cashScore +
        concentrationPenalty
    )
  );

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

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">
              Portfolio Health Score
            </div>

            <div className="text-3xl font-bold text-cyan-300 mt-1">
              {portfolioHealth}/100
            </div>
          </div>

          <div
            className={`px-3 py-2 rounded-xl text-sm font-bold ${
              portfolioHealth >= 80
                ? "bg-green-500/20 text-green-400"
                : portfolioHealth >= 60
                ? "bg-yellow-500/20 text-yellow-300"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {portfolioHealth >= 80
              ? "Strong"
              : portfolioHealth >= 60
              ? "Moderate"
              : "Risky"}
          </div>
        </div>

        <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-2 bg-cyan-400 rounded-full"
            style={{
              width: `${portfolioHealth}%`
            }}
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">
              Portfolio Performance
            </div>

            <div
              className={`text-2xl font-bold mt-1 ${
                unrealizedPnL >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {unrealizedPnL >= 0 ? "+" : ""}
              KES{" "}
              {Math.round(
                unrealizedPnL
              ).toLocaleString()}
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">
              Today's Trend
            </div>

            <div
              className={`font-bold ${
                unrealizedPnL >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {unrealizedPnL >= 0
                ? "▲ Bullish"
                : "▼ Bearish"}
            </div>
          </div>
        </div>

        <div className="mt-5 h-24 bg-slate-950 rounded-xl border border-slate-800 flex items-end gap-1 px-3 py-2 overflow-hidden">
          {[
            25, 30, 40, 35, 48, 52, 65, 70, 68,
            78, 85, 92
          ].map((height, index) => (
            <div
              key={index}
              className={
                unrealizedPnL >= 0
                  ? "flex-1 bg-green-400/70 rounded-t"
                  : "flex-1 bg-red-400/70 rounded-t"
              }
              style={{
                height: `${height}%`
              }}
            />
          ))}
        </div>
      </div>

      <PieChart
        holdings={groupedHoldings}
        total={currentValue}
      />

      <SectorPieChart
        holdings={groupedHoldings}
        total={currentValue}
      />

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowSummary(true)}
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl py-4 font-bold text-cyan-300"
        >
          Portfolio Summary
        </button>

        <button
          onClick={() => setShowDetails(true)}
          className="bg-cyan-600 hover:bg-cyan-500 rounded-2xl py-4 font-bold text-white"
        >
          Portfolio Details
        </button>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500 rounded-2xl p-4">
        <div className="text-cyan-400 font-bold">
          Coach G Portfolio Advice
        </div>

        <p className="text-sm text-slate-300 mt-2">
          {portfolioAdvice}
        </p>
      </div>

      {showDetails && (
        <PortfolioDetailsModal
          holdings={groupedHoldings}
          brokerFilter={brokerFilter}
          setBrokerFilter={setBrokerFilter}
          brokers={brokers}
          currentValue={currentValue}
          expandedSymbol={expandedSymbol}
          setExpandedSymbol={setExpandedSymbol}
          largestHolding={largestHolding}
          unrealizedPnL={unrealizedPnL}
          onClose={() => setShowDetails(false)}
        />
      )}

      {showSummary && (
        <PortfolioSummaryModal
          currentValue={currentValue}
          investedValue={investedValue}
          unrealizedPnL={unrealizedPnL}
          freeCash={freeCash}
          onClose={() => setShowSummary(false)}
        />
      )}
    </motion.div>
  );
}

function PortfolioDetailsModal({
  holdings,
  brokerFilter,
  setBrokerFilter,
  brokers,
  currentValue,
  expandedSymbol,
  setExpandedSymbol,
  largestHolding,
  unrealizedPnL,
  onClose
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 text-white overflow-y-auto">
      <div className="sticky top-0 bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Portfolio Details
          </h2>

          <p className="text-sm text-slate-400">
            All securities currently held
          </p>
        </div>

        <button
          onClick={onClose}
          className="bg-slate-800 rounded-xl px-4 py-2 font-bold text-cyan-300"
        >
          Close
        </button>
      </div>

      <div className="p-4 space-y-5">
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
              <HeaderColumn title="Security" sub="Quantity" />

              <HeaderColumn
                title="Avg. Price"
                sub="Inv. Value"
                center
              />

              <HeaderColumn
                title="LTP"
                sub="Current Value"
                center
              />

              <HeaderColumn
                title="P&L Value"
                sub="P&L %"
                right
              />
            </div>

            {holdings.map((item) => (
              <HoldingRow
                key={item.symbol}
                item={item}
                currentValue={currentValue}
                expandedSymbol={expandedSymbol}
                setExpandedSymbol={setExpandedSymbol}
              />
            ))}

            {holdings.length === 0 && (
              <div className="p-6 text-center text-slate-400">
                No holdings available.
              </div>
            )}
          </div>
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
              value={
                unrealizedPnL >= 0
                  ? "Positive"
                  : "Negative"
              }
              color={
                unrealizedPnL >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }
            />

            <Insight
              title="Diversification"
              value={`${holdings.length} Holdings`}
              color="text-yellow-300"
            />

            <Insight
              title="AI Risk Level"
              value={
                holdings.length < 4
                  ? "Moderate"
                  : "Balanced"
              }
              color="text-cyan-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function HoldingRow({
  item,
  currentValue,
  expandedSymbol,
  setExpandedSymbol
}) {
  const pnl = Number(item.unrealizedPnL || 0);

  const positiveMove =
    Number(item.marketPrice || 0) >=
    Number(item.averageCost || 0);

  const pnlColor =
    pnl >= 0 ? "text-green-400" : "text-red-400";

  const invested =
    Number(item.totalCost || item.costValue || 0) > 0
      ? Number(item.totalCost || item.costValue || 0)
      : Number(item.quantity || 0) *
        Number(item.averageCost || 0);

  const avgPrice =
    Number(item.quantity || 0) > 0
      ? Number(
          (
            invested /
            Number(item.quantity || 1)
          ).toFixed(2)
        )
      : Number(item.averageCost || 0);

  const current =
    Number(item.quantity || 0) *
    Number(item.marketPrice || 0);

  return (
    <div
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
            {avgPrice.toFixed(2)}
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
            {Number(item.marketPrice || 0).toFixed(2)}
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
              title="Brokers"
              value={
                item.brokers?.join(", ") ||
                item.broker ||
                "Unknown"
              }
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
}

function HeaderColumn({
  title,
  sub,
  center = false,
  right = false
}) {
  return (
    <div
      className={`flex flex-col ${
        right
          ? "items-end"
          : center
          ? "items-center"
          : ""
      }`}
    >
      <span className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">
        {title}
      </span>

      <span className="text-[10px] text-slate-500 mt-1">
        {sub}
      </span>
    </div>
  );
}

function Metric({
  title,
  value,
  color = "text-white"
}) {
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

function PortfolioSummaryModal({
  currentValue,
  investedValue,
  unrealizedPnL,
  freeCash,
  onClose
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 text-white overflow-y-auto">
      <div className="sticky top-0 bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Portfolio Summary
          </h2>

          <p className="text-sm text-slate-400">
            Account valuation breakdown
          </p>
        </div>

        <button
          onClick={onClose}
          className="bg-slate-800 rounded-xl px-4 py-2 font-bold text-cyan-300"
        >
          Close
        </button>
      </div>

      <div className="p-4 space-y-5">
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
          <div className="px-4 py-4 border-b border-slate-800">
            <h3 className="font-bold text-lg">
              Balance Breakdown
            </h3>
          </div>

          <div className="divide-y divide-slate-800">
            <SummaryRow
              label="Portfolio Value Free"
              value={currentValue}
            />

            <SummaryRow
              label="Portfolio Value Frozen"
              value={0}
            />

            <SummaryRow
              label="Portfolio Value Pledge"
              value={0}
            />

            <SummaryRow
              label="Portfolio Value Others"
              value={0}
            />

            <SummaryRow
              label="Unsettled Purchase Value"
              value={0}
            />

            <SummaryRow
              label="Unsettled Sale Value"
              value={0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="text-slate-300">
        {label}
      </div>

      <div className="font-bold text-white">
        KES {Number(value || 0).toLocaleString()}
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