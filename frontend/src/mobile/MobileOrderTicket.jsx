import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import MobileBuyingPowerBar from "./MobileBuyingPowerBar";
import SwipeTradeButton from "../components/mobile/SwipeTradeButton";
import MobileBottomNav from "../components/mobile/MobileBottomNav";
import useOrderSocket from "../hooks/useOrderSocket";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function formatMoney(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

export default function MobileOrderTicket() {
  const { symbol, side } = useParams();
  const navigate = useNavigate();
  const {
  latestOrder,
  connected: orderSocketConnected
} = useOrderSocket();

  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [marketPrice, setMarketPrice] = useState(0);
  const [orderType, setOrderType] = useState("LIMIT");
  const [validity, setValidity] = useState("DAY");
  const [expiryDate, setExpiryDate] = useState("");
  const [tradingMode, setTradingMode] = useState("DELIVERY");
  const [broker, setBroker] = useState("AUTO");
  const [wallet, setWallet] = useState(null);
  const [portfolio, setPortfolio] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [execution, setExecution] = useState(null);
  const [success, setSuccess] = useState(false);
  const [brokerCash, setBrokerCash] = useState([]);

  const effectivePrice =
    orderType === "MARKET"
      ? Number(marketPrice || 0)
      : Number(limitPrice || 0);

  const estimatedValue =
    Number(quantity || 0) * Number(effectivePrice || 0);

  const availableFunds = Number(wallet?.balance || 0);

  const portfolioValue =
  Number(portfolio?.totalMarketValue || 0);

const currentHolding =
  (portfolio?.holdings || []).find(
    (item) =>
      String(item.symbol || "").trim() ===
      String(symbol || "").trim()
  );

const currentExposure =
  portfolioValue > 0 && currentHolding
    ? Math.round(
        (Number(currentHolding.marketValue || 0) /
          portfolioValue) *
          100
      )
    : 0;

const postTradeExposure =
  side === "BUY" && portfolioValue > 0
    ? Math.round(
        ((Number(currentHolding?.marketValue || 0) +
          estimatedValue) /
          (portfolioValue + estimatedValue)) *
          100
      )
    : currentExposure;

const selectedBrokerCash =
  brokerCash.find(
    (item) => item.broker === broker
  ) || null;

const selectedBrokerBuyingPower =
  broker === "AUTO"
    ? brokerCash.reduce(
        (sum, item) =>
          sum + Number(item.buyingPower || 0),
        0
      )
    : Number(
        selectedBrokerCash?.buyingPower || 0
      );

const brokerFundsWarning =
  side === "BUY" &&
  estimatedValue > selectedBrokerBuyingPower;

const exposureWarning =
  side === "BUY" && postTradeExposure >= 40;

  const priceRange = useMemo(() => {
    const reference = Number(marketPrice || 0);

    return {
      min:
        reference > 0
          ? Number((reference * 0.9).toFixed(2))
          : 0,
      max:
        reference > 0
          ? Number((reference * 1.1).toFixed(2))
          : 0
    };
  }, [marketPrice]);

  const insufficientFunds =
    side === "BUY" && estimatedValue > availableFunds;

  const invalidQuantity =
    Number(quantity || 0) <= 0;

  const invalidLimitPrice =
    orderType === "LIMIT" &&
    Number(limitPrice || 0) <= 0;

  const invalidPriceRange =
    orderType === "LIMIT" &&
    marketPrice > 0 &&
    Number(limitPrice || 0) > 0 &&
    (Number(limitPrice) < priceRange.min ||
      Number(limitPrice) > priceRange.max);

  const invalidGtdDate =
    validity === "GTD" && !expiryDate;

  const canSubmit =
    !loading &&
    !invalidQuantity &&
    !invalidLimitPrice &&
    !invalidPriceRange &&
    !invalidGtdDate &&
    !insufficientFunds &&
    !brokerFundsWarning;

  async function loadWallet() {
    try {
      const res = await fetch(`${API_URL}/wallet/balance`);
      const data = await res.json();

      if (data.ok) {
        setWallet(data.wallet);
      }
    } catch (error) {
      console.error("Failed to load wallet:", error);
    }
  }

  async function loadPortfolio() {
  try {
    const res = await fetch(`${API_URL}/portfolio/unified`);
    const data = await res.json();

    if (data.ok) {
      setPortfolio(data.portfolio);
    }
  } catch (error) {
    console.error("Failed to load portfolio:", error);
  }
}

async function loadBrokerCash() {
  try {
    const res = await fetch(`${API_URL}/broker-cash`);
    const data = await res.json();

    if (data.ok) {
      setBrokerCash(data.brokers || []);
    }
  } catch (error) {
    console.error("Failed to load broker cash:", error);
  }
}

  async function loadMarketPrice() {
    try {
      const res = await fetch(`${API_URL}/prices`);
      const data = await res.json();

      const found = (data.data || []).find(
        (item) => item.symbol === symbol
      );

      if (found) {
        const currentPrice = Number(
          found.price ||
            found.lastPrice ||
            found.currentPrice ||
            0
        );

        if (currentPrice > 0) {
          setMarketPrice(currentPrice);
        }
      }
    } catch (error) {
      console.error("Failed to load market price:", error);
    }
  }

  useEffect(() => {
  loadWallet();
  loadPortfolio();
  loadBrokerCash();
  loadMarketPrice();

  const interval = setInterval(() => {
    loadMarketPrice();
    loadBrokerCash();
    loadWallet();
  }, 5000);

  return () => clearInterval(interval);
}, [symbol]);

  useEffect(() => {
    if (orderType === "MARKET") {
      setLimitPrice("");
    }
  }, [orderType]);

useEffect(() => {
  if (
    latestOrder &&
    latestOrder.id === orderId
  ) {
    setExecution(latestOrder);
  }
}, [latestOrder, orderId]);

  async function executeOrder() {
    if (!canSubmit) {
      if (invalidQuantity) {
        setMessage("Enter a valid quantity.");
      } else if (invalidLimitPrice) {
        setMessage("Enter a valid limit price.");
      } else if (invalidPriceRange) {
        setMessage("Limit price is outside the allowed price range.");
      } else if (invalidGtdDate) {
        setMessage("Select a Good Till Date.");
      } else if (insufficientFunds) {
        setMessage("Order blocked: insufficient available funds.");
      }

      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        symbol,
        side,
        quantity: Number(quantity),
        price: Number(effectivePrice),
        orderType,
        validity,
        expiryDate:
          validity === "GTD" ? expiryDate : null,
        tradingMode
      };

      if (broker !== "AUTO") {
        payload.broker = broker;
      }

      const res = await fetch(`${API_URL}/execution/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!data.ok) {
        setMessage(data.error || "Order failed");
        return;
      }

      setOrderId(data.order.id);
      setExecution(data.order);
      setMessage(`Order submitted: ${data.order.id}`);
      setSuccess(true);

      setTimeout(() => {
        navigate(`/mobile/stock/${symbol}`);
      }, 6000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!orderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/execution/queue`);
        const data = await res.json();

        const queue = data.queue || data.orders || [];

        const found = queue.find(
          (item) => item.id === orderId
        );

        if (found) {
          setExecution(found);
        }
      } catch (error) {
        console.error("Execution polling failed:", error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <MobileBuyingPowerBar />

      <div className="p-4">
        <a
          href={`/mobile/stock/${symbol}`}
          className="text-cyan-400 text-sm"
        >
          ← Back to {symbol}
        </a>

        <div className="bg-slate-900 rounded-2xl mt-4 border border-slate-800 overflow-hidden">
          <div className="bg-blue-600 p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-3xl font-bold">
                  {symbol}
                </div>

                <div className="text-sm mt-1 text-white/90">
                  {side} QTY{" "}
                  {Number(
                    quantity || 0
                  ).toLocaleString()}{" "}
                  @ {formatMoney(effectivePrice)} →{" "}
                  {formatMoney(estimatedValue)}
                </div>
              </div>

              <div
                className={
                  side === "BUY"
                    ? "text-green-300 text-3xl font-bold"
                    : "text-red-300 text-3xl font-bold"
                }
              >
                {side}
              </div>
            </div>
          </div>

          <div className="p-5">
            <h2 className="text-xl font-bold mb-4">
              Order Entry
            </h2>

            <div className="mb-4">
              <label className="text-sm text-slate-400">
                Security
              </label>

              <input
                value={symbol}
                readOnly
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-400">
                  Instrument Type
                </label>

                <input
                  value="Normal"
                  readOnly
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Quantity
                </label>

                <input
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value)
                  }
                  inputMode="numeric"
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
                />

                <div className="text-right text-xs text-slate-500 mt-1">
                  Lot size 1
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-sm text-slate-400">
                  Order Type
                </label>

                <div className="grid grid-cols-2 mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setOrderType("LIMIT")
                    }
                    className={
                      orderType === "LIMIT"
                        ? "py-3 bg-cyan-500 text-slate-950 font-bold"
                        : "py-3 text-slate-300"
                    }
                  >
                    Limit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setOrderType("MARKET")
                    }
                    className={
                      orderType === "MARKET"
                        ? "py-3 bg-cyan-500 text-slate-950 font-bold"
                        : "py-3 text-slate-300"
                    }
                  >
                    Market
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Price
                </label>

                <input
                  value={
                    orderType === "MARKET"
                      ? marketPrice || ""
                      : limitPrice
                  }
                  onChange={(e) =>
                    setLimitPrice(e.target.value)
                  }
                  readOnly={orderType === "MARKET"}
                  inputMode="decimal"
                  className={
                    orderType === "MARKET"
                      ? "w-full mt-1 bg-slate-700 border border-slate-700 rounded-xl px-4 py-3 text-slate-300"
                      : "w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
                  }
                />

                {orderType === "LIMIT" &&
                  marketPrice > 0 && (
                    <div className="text-right text-xs text-slate-500 mt-1">
                      {priceRange.min.toFixed(2)} to{" "}
                      {priceRange.max.toFixed(2)}
                    </div>
                  )}

                {orderType === "MARKET" && (
                  <div className="text-right text-xs text-slate-500 mt-1">
                    Uses live market price
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-sm text-slate-400">
                  Validity
                </label>

                <div className="grid grid-cols-2 mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setValidity("DAY");
                      setExpiryDate("");
                    }}
                    className={
                      validity === "DAY"
                        ? "py-3 bg-cyan-500 text-slate-950 font-bold"
                        : "py-3 text-slate-300"
                    }
                  >
                    Day
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setValidity("GTD")
                    }
                    className={
                      validity === "GTD"
                        ? "py-3 bg-cyan-500 text-slate-950 font-bold"
                        : "py-3 text-slate-300"
                    }
                  >
                    GTD
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Trading Mode
                </label>

                <div className="grid grid-cols-2 mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setTradingMode("DELIVERY")
                    }
                    className={
                      tradingMode === "DELIVERY"
                        ? "py-3 bg-cyan-500 text-slate-950 font-bold"
                        : "py-3 text-slate-300"
                    }
                  >
                    Delivery
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setTradingMode("INTRADAY")
                    }
                    className={
                      tradingMode === "INTRADAY"
                        ? "py-3 bg-cyan-500 text-slate-950 font-bold"
                        : "py-3 text-slate-300"
                    }
                  >
                    Intraday
                  </button>
                </div>
              </div>
            </div>

            {validity === "GTD" && (
              <div className="mt-4">
                <label className="text-sm text-slate-400">
                  Good Till Date
                </label>

                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) =>
                    setExpiryDate(e.target.value)
                  }
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="text-sm text-slate-400">
                Broker
              </label>

              <select
                value={broker}
                onChange={(e) =>
                  setBroker(e.target.value)
                }
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"
              >
                <option value="AUTO">
                  AUTO - Coach G Smart Routing
                </option>
                <option value="AIB">AIB</option>
                <option value="ABC">ABC</option>
                <option value="NCBA">NCBA</option>
              </select>
            </div>

            <div className="bg-slate-950/40 rounded-2xl p-4 mt-5 border border-slate-800">
              <div className="text-xs text-slate-400">
                Estimated Order Value
              </div>

              <div className="text-2xl font-bold text-cyan-400">
                {formatMoney(estimatedValue)}
              </div>
            </div>

<div className="bg-slate-800 rounded-2xl p-4 mt-4 border border-slate-700">
  <div className="flex justify-between items-start">
    <div>
      <div className="text-xs text-slate-400">
        Broker Buying Power
      </div>

      <div className="text-2xl font-bold text-cyan-300 mt-1">
        {formatMoney(selectedBrokerBuyingPower)}
      </div>
    </div>

    <a
      href="/mobile/broker-treasury"
      className="text-xs text-purple-300 font-bold"
    >
      Treasury →
    </a>
  </div>

  <div className="text-xs text-slate-400 mt-3">
    {broker === "AUTO"
      ? "AUTO uses combined broker liquidity for smart routing."
      : `${broker} available buying power after reserved orders.`}
  </div>
</div>

            <div className="bg-cyan-500/10 border border-cyan-500 rounded-2xl p-4 mt-5">
              <div className="text-cyan-400 font-bold">
                Coach G Execution Check

             {exposureWarning && (
  <WarningBox
    title="Portfolio Concentration Warning"
    message={`This trade would increase ${symbol} exposure to ${postTradeExposure}% of your portfolio. Coach G recommends controlling position size.`}
    type="warning"
  />
)}

              </div>

              <div className="text-sm text-slate-300 mt-2 leading-6">
                Smart routing will use the best available broker when AUTO is selected.
                Check quantity, liquidity, order type, and buying power before confirming.
              </div>

              {insufficientFunds && (
                <WarningBox
                  title="Insufficient Buying Power"
                  message={`Available: ${formatMoney(
                    availableFunds
                  )} • Required: ${formatMoney(
                    estimatedValue
                  )}`}
                  type="error"
                />
              )}

{brokerFundsWarning && (
  <WarningBox
    title="Broker Buying Power Warning"
    message={`Required ${formatMoney(
      estimatedValue
    )}, but available broker buying power is ${formatMoney(
      selectedBrokerBuyingPower
    )}.`}
    type="error"
  />
)}

              {invalidPriceRange && (
                <WarningBox
                  title="Price Range Warning"
                  message={`Limit price must be between KES ${priceRange.min.toFixed(
                    2
                  )} and KES ${priceRange.max.toFixed(2)}.`}
                  type="warning"
                />
              )}

              {invalidQuantity && (
                <WarningBox
                  title="Quantity Required"
                  message="Enter quantity before submitting the order."
                  type="warning"
                />
              )}

              {invalidGtdDate && (
                <WarningBox
                  title="Good Till Date Required"
                  message="Select an expiry date for GTD orders."
                  type="warning"
                />
              )}
            </div>

            <div className="mt-5">
              <SwipeTradeButton
                disabled={!canSubmit}
                text={
                  insufficientFunds
                    ? "Insufficient Funds"
                    : brokerFundsWarning
                    ? "Broker Funds Low"
                    : invalidPriceRange
                    ? "Invalid Price"
                    : invalidQuantity
                    ? "Enter Quantity"
                    : invalidLimitPrice
                    ? "Enter Price"
                    : invalidGtdDate
                    ? "Select GTD Date"
                    : loading
                    ? "Submitting..."
                    : `Swipe To ${side}`
                }
                color={
                  !canSubmit
                    ? "bg-slate-700"
                    : side === "BUY"
                    ? "bg-green-500"
                    : "bg-red-500"
                }
                onComplete={executeOrder}
              />
            </div>

            {message && (
              <div className="mt-4 bg-slate-800 rounded-xl p-3 text-sm text-cyan-300">
                {message}
              </div>
            )}
          </div>
        </div>

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 bg-green-500/10 border border-green-500 rounded-2xl p-5 text-center shadow-[0_0_30px_rgba(34,197,94,0.25)]"
          >
            <div className="text-4xl mb-2">✓</div>

            <div className="text-green-400 font-bold text-lg">
              {side} ORDER SUBMITTED
            </div>

            <div className="text-sm text-slate-300 mt-1">
              Coach G Smart Routing Active
            </div>
          </motion.div>
        )}

<div className="mt-4 text-xs">
  <span
    className={
      orderSocketConnected
        ? "text-green-400"
        : "text-yellow-400"
    }
  >
    {orderSocketConnected
      ? "● Live execution stream connected"
      : "● Using execution polling fallback"}
  </span>
</div>

        {execution && (
          <div className="bg-slate-900 rounded-2xl p-5 mt-5 border border-cyan-500/30">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-cyan-400 font-bold">
                  Live Execution
                </div>

                <div className="text-xs text-slate-400">
                  {execution.id}
                </div>
              </div>

              <div className="text-sm font-bold text-cyan-300">
                {execution.status}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Fill Progress</span>
                <span>{execution.fillPercent || 0}%</span>
              </div>

              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-green-400 rounded-full"
                  style={{
                    width: `${execution.fillPercent || 0}%`
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {(execution.executionEvents || []).map(
                (event, index) => (
                  <div
                    key={`${event.status}-${index}`}
                    className="flex gap-3 items-start"
                  >
                    <div className="w-3 h-3 rounded-full bg-cyan-400 mt-1 animate-pulse" />

                    <div>
                      <div className="font-bold text-sm">
                        {event.status}
                      </div>

                      <div className="text-xs text-slate-400">
                        {event.message}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}

function WarningBox({ title, message, type }) {
  return (
    <div
      className={
        type === "error"
          ? "bg-red-500/10 border border-red-500 rounded-2xl p-4 mt-4"
          : "bg-yellow-500/10 border border-yellow-500 rounded-2xl p-4 mt-4"
      }
    >
      <div
        className={
          type === "error"
            ? "text-red-400 font-bold"
            : "text-yellow-400 font-bold"
        }
      >
        {title}
      </div>

      <div className="text-sm text-slate-300 mt-2">
        {message}
      </div>
    </div>
  );
}