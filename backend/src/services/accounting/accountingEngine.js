import { v4 as uuidv4 } from "uuid";
import { state, getUser, getHolding, saveHolding, audit } from "../../store/state.js";
import { calculateTradeFees } from "./fees.js";

function ensureAccountingStore() {
  if (!state.ledger) state.ledger = [];
  if (!state.cashLocks) state.cashLocks = [];
}

export function ledgerEntry({ userId, type, amount, status = "POSTED", reference, description, metadata = {} }) {
  ensureAccountingStore();

  const row = {
    id: uuidv4(),
    userId,
    type,
    amount: Number(Number(amount).toFixed(2)),
    currency: "KES",
    status,
    reference: reference || uuidv4(),
    description,
    metadata,
    createdAt: new Date().toISOString()
  };

  state.ledger.unshift(row);
  return row;
}

export function getLedgerRows(userId) {
  ensureAccountingStore();
  return state.ledger.filter(x => !userId || x.userId === userId);
}

export function getPendingPayments(userId) {
  ensureAccountingStore();
  return state.ledger
    .filter(x => x.userId === userId)
    .filter(x => ["PENDING", "PROCESSING"].includes(String(x.status || "").toUpperCase()))
    .reduce((sum, x) => sum + Math.abs(Number(x.amount || 0)), 0);
}

export function getPendingOrderLocks(userId) {
  ensureAccountingStore();
  return state.cashLocks
    .filter(x => x.userId === userId && x.status === "LOCKED")
    .reduce((sum, x) => sum + Number(x.amount || 0), 0);
}

export function getBalances(userId, holdingsCurrentValue = 0) {
  const user = getUser(userId);
  if (!user) throw new Error("User not found");

  const ledgerBalance = Number(user.cash || 0);
  const pendingOrders = getPendingOrderLocks(userId);
  const pendingPayments = getPendingPayments(userId);
  const availableFunds = ledgerBalance - pendingOrders - pendingPayments;
  const totalEquity = ledgerBalance + Number(holdingsCurrentValue || 0);

  return {
    ledgerBalance: Number(ledgerBalance.toFixed(2)),
    pendingOrders: Number(pendingOrders.toFixed(2)),
    pendingPayments: Number(pendingPayments.toFixed(2)),
    availableFunds: Number(availableFunds.toFixed(2)),
    holdingsCurrentValue: Number(Number(holdingsCurrentValue || 0).toFixed(2)),
    totalEquity: Number(totalEquity.toFixed(2))
  };
}

export function reserveBuyOrder({ userId, symbol, qty, price, orderId }) {
  ensureAccountingStore();
  const user = getUser(userId);
  if (!user) throw new Error("User not found");

  const fees = calculateTradeFees({ side: "BUY", price, qty });
  const balances = getBalances(userId);

  if (fees.cashRequired > balances.availableFunds) {
    const err = new Error("Insufficient available funds");
    err.statusCode = 400;
    throw err;
  }

  const lock = {
    id: uuidv4(),
    userId,
    orderId,
    symbol,
    qty: Number(qty),
    price: Number(price),
    amount: fees.cashRequired,
    status: "LOCKED",
    createdAt: new Date().toISOString(),
    fees
  };

  state.cashLocks.unshift(lock);

  ledgerEntry({
    userId,
    type: "ORDER_CASH_LOCK",
    amount: 0,
    status: "INFO",
    reference: orderId,
    description: `Locked ${fees.cashRequired} for BUY ${qty} ${symbol}`,
    metadata: { lockId: lock.id, fees }
  });

  audit("CASH_LOCKED_FOR_ORDER", `Locked KES ${fees.cashRequired} for BUY ${symbol}`, userId, { orderId, fees });

  return { fees, lock, balances: getBalances(userId) };
}

export function releaseOrderLock({ userId, orderId, reason = "Released order lock" }) {
  ensureAccountingStore();

  let released = 0;
  state.cashLocks = state.cashLocks.map(lock => {
    if (lock.userId === userId && lock.orderId === orderId && lock.status === "LOCKED") {
      released += Number(lock.amount || 0);
      return {
        ...lock,
        status: "RELEASED",
        releasedAt: new Date().toISOString(),
        releaseReason: reason
      };
    }
    return lock;
  });

  if (released > 0) {
    ledgerEntry({
      userId,
      type: "ORDER_CASH_UNLOCK",
      amount: 0,
      status: "INFO",
      reference: orderId,
      description: `${reason}: KES ${released}`
    });
  }

  return Number(released.toFixed(2));
}

export function postBuyExecution({ userId, symbol, qty, price, orderId }) {
  ensureAccountingStore();
  const user = getUser(userId);
  if (!user) throw new Error("User not found");

  const fees = calculateTradeFees({ side: "BUY", price, qty });
  const balances = getBalances(userId);

  if (fees.cashRequired > balances.availableFunds + getPendingOrderLocks(userId)) {
    const err = new Error("Insufficient ledger balance for execution");
    err.statusCode = 400;
    throw err;
  }

  releaseOrderLock({ userId, orderId, reason: "Executed BUY order" });

  user.cash = Number((Number(user.cash || 0) - fees.cashRequired).toFixed(2));

  const h = getHolding(userId, symbol);
  const oldQty = Number(h.qty || 0);
  const oldAvg = Number(h.avgPrice || 0);
  const newQty = oldQty + Number(qty);
  const oldCost = oldQty * oldAvg;
const buyCostIncludingFees = fees.cashRequired;

h.avgPrice =
  newQty === 0
    ? 0
    : Number(((oldCost + buyCostIncludingFees) / newQty).toFixed(4));
  h.qty = newQty;
  saveHolding(userId, h);

  ledgerEntry({
    userId,
    type: "BUY_EXECUTION",
    amount: -fees.cashRequired,
    status: "POSTED",
    reference: orderId,
    description: `BUY ${qty} ${symbol} @ ${price}, fees included`,
    metadata: { symbol, qty, price, fees }
  });

  audit("BUY_EXECUTED_ACCOUNTING_POSTED", `BUY ${qty} ${symbol}; deducted KES ${fees.cashRequired}`, userId, { orderId, fees });

  return { fees, balances: getBalances(userId) };
}

export function postSellExecution({ userId, symbol, qty, price, orderId }) {
  ensureAccountingStore();
  const user = getUser(userId);
  if (!user) throw new Error("User not found");

  const h = getHolding(userId, symbol);
  if (Number(h.qty || 0) < Number(qty)) {
    const err = new Error("Insufficient shares");
    err.statusCode = 400;
    throw err;
  }

  const fees = calculateTradeFees({ side: "SELL", price, qty });
  const proceeds = fees.estimatedProceeds;

  h.qty = Number(h.qty) - Number(qty);
  h.realizedPnl = Number(h.realizedPnl || 0) + ((Number(price) - Number(h.avgPrice || 0)) * Number(qty));
  if (h.qty === 0) h.avgPrice = 0;
  saveHolding(userId, h);

  user.cash = Number((Number(user.cash || 0) + proceeds).toFixed(2));

  ledgerEntry({
    userId,
    type: "SELL_EXECUTION",
    amount: proceeds,
    status: "POSTED",
    reference: orderId,
    description: `SELL ${qty} ${symbol} @ ${price}, fees deducted`,
    metadata: { symbol, qty, price, fees }
  });

  audit("SELL_EXECUTED_ACCOUNTING_POSTED", `SELL ${qty} ${symbol}; credited KES ${proceeds}`, userId, { orderId, fees });

  return { fees, balances: getBalances(userId) };
}
