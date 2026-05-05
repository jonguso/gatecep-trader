import { v4 as uuidv4 } from "uuid";
import { state, getUser, getHolding, saveHolding, audit } from "../../store/state.js";
import { calculateTradeFees } from "./fees.js";

export function getPendingPayments(userId) {
  return (state.ledger || [])
    .filter(x => x.userId === userId && ["PENDING", "PROCESSING"].includes(String(x.status).toUpperCase()))
    .reduce((sum, x) => sum + Math.abs(Number(x.amount || 0)), 0);
}

export function getPendingOrderLocks(userId) {
  return (state.cashLocks || [])
    .filter(x => x.userId === userId && x.status === "LOCKED")
    .reduce((sum, x) => sum + Number(x.amount || 0), 0);
}

export function getBalances(userId, holdingsCurrentValue = 0) {
  const user = getUser(userId);
  const ledgerBalance = Number(user?.cash || 0);
  const pendingOrders = getPendingOrderLocks(userId);
  const pendingPayments = getPendingPayments(userId);
  return {
    ledgerBalance,
    pendingOrders,
    pendingPayments,
    availableFunds: Number((ledgerBalance - pendingOrders - pendingPayments).toFixed(2)),
    holdingsCurrentValue: Number(holdingsCurrentValue || 0),
    totalEquity: Number((ledgerBalance + Number(holdingsCurrentValue || 0)).toFixed(2))
  };
}

export function ledgerEntry({ userId, type, amount, status = "POSTED", reference, description, metadata = {} }) {
  const row = { id: uuidv4(), userId, type, amount: Number(amount.toFixed ? amount.toFixed(2) : amount), status, reference, description, metadata, createdAt: new Date().toISOString() };
  state.ledger.unshift(row);
  return row;
}

export function postBuyExecution({ userId, symbol, qty, price, orderId }) {
  const user = getUser(userId);
  const fees = calculateTradeFees({ side: "BUY", price, qty });
  const balances = getBalances(userId);
  if (fees.cashRequired > balances.availableFunds) {
    const err = new Error("Insufficient available funds");
    err.statusCode = 400;
    throw err;
  }

  user.cash = Number((Number(user.cash || 0) - fees.cashRequired).toFixed(2));

  const h = getHolding(userId, symbol);
  const oldQty = Number(h.qty || 0);
  const oldAvgPrice = Number(h.avgPrice || 0);
  const newBuyQty = Number(qty);
  const oldInvestedValue = oldQty * oldAvgPrice;
  const newBuyInvestedValue = fees.cashRequired;
  const newQty = oldQty + newBuyQty;

  h.avgPrice = newQty === 0 ? 0 : Number(((oldInvestedValue + newBuyInvestedValue) / newQty).toFixed(4));
  h.qty = newQty;
  saveHolding(userId, h);

  ledgerEntry({ userId, type: "BUY_EXECUTION", amount: -fees.cashRequired, reference: orderId, description: `BUY ${qty} ${symbol}`, metadata: { fees } });
  audit("BUY_EXECUTED", `BUY ${qty} ${symbol}`, userId, { fees });
  return { fees, balances: getBalances(userId) };
}

export function postSellExecution({ userId, symbol, qty, price, orderId }) {
  const user = getUser(userId);
  const h = getHolding(userId, symbol);
  if (Number(h.qty || 0) < Number(qty)) {
    const err = new Error("Insufficient shares");
    err.statusCode = 400;
    throw err;
  }
  const fees = calculateTradeFees({ side: "SELL", price, qty });
  h.qty = Number(h.qty) - Number(qty);
  h.realizedPnl = Number(h.realizedPnl || 0) + ((Number(price) - Number(h.avgPrice || 0)) * Number(qty));
  if (h.qty === 0) h.avgPrice = 0;
  saveHolding(userId, h);
  user.cash = Number((Number(user.cash || 0) + fees.estimatedProceeds).toFixed(2));
  ledgerEntry({ userId, type: "SELL_EXECUTION", amount: fees.estimatedProceeds, reference: orderId, description: `SELL ${qty} ${symbol}`, metadata: { fees } });
  return { fees, balances: getBalances(userId) };
}
