import { getBroker } from "../data/brokers.js";
import { getPortfolioValue } from "../store/state.js";
import { getLatestPrices } from "../services/marketData/SimulatedDataAdapter.js";

export function generateRecommendation({ symbol = "SCOM", user, brokerId }) {
  const broker = getBroker(brokerId || user?.selectedBrokerId || "mock-broker");
  const portfolio = getPortfolioValue(user.id, getLatestPrices());
  const holdingsValue = portfolio.reduce((s, h) => s + h.marketValue, 0);
  const holding = portfolio.find(h => h.symbol === symbol);
  const exposure = holdingsValue > 0 && holding ? holding.marketValue / holdingsValue : 0;

  let confidence = 62;
  if (exposure > 0.5) confidence -= 20;
  if (broker?.status !== "ACTIVE_DEMO" && !broker?.supportsApiTrading) confidence -= 8;
  if (user.riskProfile === "CONSERVATIVE") confidence -= 5;

  confidence = Math.max(0, Math.min(100, Math.round(confidence)));
  const action = confidence >= 70 ? "BUY" : confidence <= 40 ? "SELL" : "HOLD";

  return {
    coach: "Coach G",
    symbol,
    action,
    confidence,
    broker: broker?.name,
    brokerStatus: broker?.status,
    estimatedBrokerFees: broker?.fees,
    exposurePercent: Number((exposure * 100).toFixed(1)),
    message:
      action === "BUY"
        ? `Coach G sees a controlled BUY setup for ${symbol}, but execution depends on your selected broker: ${broker?.name}.`
        : action === "SELL"
        ? `Coach G suggests reducing or avoiding exposure in ${symbol}.`
        : `Coach G suggests HOLD for ${symbol}. Review broker fees, liquidity, and portfolio exposure before trading.`,
    disclaimer: "AI-assisted decision support only. Confirm all orders with your selected licensed broker."
  };
}
