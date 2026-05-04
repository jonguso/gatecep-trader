import { getPortfolioValue } from "../../store/state.js";
import { getLatestPrices } from "../marketData/SimulatedDataAdapter.js";

export function validatePreTradeRisk({ user, side, price, qty, broker }) {
  const notional = Number(price) * Number(qty);
  const portfolio = getPortfolioValue(user.id, getLatestPrices());
  const holdingsValue = portfolio.reduce((s, h) => s + h.marketValue, 0);
  const equity = user.cash + holdingsValue;
  const commission = Math.max((broker?.fees?.commissionBps || 200) / 10000 * notional, broker?.fees?.minFee || 0);

  if (notional <= 0) throw new Error("Invalid order notional");
  if (side === "BUY" && notional + commission > user.cash) throw new Error("Insufficient cash including broker fees");

  if (equity > 0 && notional / equity > 0.5) {
    const err = new Error("Order exceeds 50% of account equity. Reduce size or request approval.");
    err.statusCode = 400;
    throw err;
  }

  return { approved: true, notional, equity, estimatedBrokerFees: Number(commission.toFixed(2)), maxAllowedNotional: equity * 0.5 };
}
