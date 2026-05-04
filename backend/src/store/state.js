import { v4 as uuidv4 } from "uuid";

export const state = {
  users: [
    {
      id: "u1",
      name: "Demo Trader",
      email: "demo@gatecep.local",
      password: "demo123",
      role: "TRADER",
      kycStatus: "APPROVED",
      riskProfile: "BALANCED",
      selectedBrokerId: "mock-broker",
      brokerCustomerId: "MOCK-CUST-U1",
      cdsAccount: "CDS-DEMO-U1",
      cash: 100000
    }
  ],
  brokerLinks: [
    {
      id: "link-u1-mock",
      userId: "u1",
      brokerId: "mock-broker",
      brokerCustomerId: "MOCK-CUST-U1",
      cdsAccount: "CDS-DEMO-U1",
      status: "VERIFIED",
      createdAt: new Date().toISOString()
    }
  ],
  portfolios: { u1: {} },
  orderLog: [],
  auditLog: [],
  ledger: []
};

export function audit(event, detail, userId = null, metadata = {}) {
  const row = { id: uuidv4(), time: new Date().toISOString(), event, detail, userId, metadata };
  state.auditLog.unshift(row);
  return row;
}

export function ledgerEntry({ userId, type, amount, status = "POSTED", reference, description, metadata = {} }) {
  const row = {
    id: uuidv4(),
    userId,
    type,
    amount: Number(amount),
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

export function getUser(userId) {
  return state.users.find(u => u.id === userId);
}

export function getUserByEmail(email) {
  return state.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
}

export function getUserBrokerLink(userId, brokerId = null) {
  const user = getUser(userId);
  const targetBrokerId = brokerId || user?.selectedBrokerId;
  return state.brokerLinks.find(l => l.userId === userId && l.brokerId === targetBrokerId);
}

export function getHolding(userId, symbol) {
  return state.portfolios[userId]?.[symbol] || { symbol, qty: 0, avgPrice: 0, realizedPnl: 0 };
}

export function saveHolding(userId, holding) {
  if (!state.portfolios[userId]) state.portfolios[userId] = {};
  state.portfolios[userId][holding.symbol] = holding;
}

export function applyBuy(userId, symbol, qty, price, reference = "trade") {
  const user = getUser(userId);
  if (!user) throw new Error("User not found");

  const cost = qty * price;
  if (user.cash < cost) throw new Error("Insufficient cash");

  const h = getHolding(userId, symbol);
  const newQty = h.qty + qty;
  h.avgPrice = newQty === 0 ? 0 : ((h.qty * h.avgPrice) + cost) / newQty;
  h.qty = newQty;
  user.cash -= cost;
  saveHolding(userId, h);

  ledgerEntry({ userId, type: "SECURITY_BUY", amount: -cost, reference, description: `Bought ${qty} ${symbol} @ ${price}` });
}

export function applySell(userId, symbol, qty, price, reference = "trade") {
  const user = getUser(userId);
  if (!user) throw new Error("User not found");

  const h = getHolding(userId, symbol);
  if (h.qty < qty) throw new Error("Insufficient shares");

  const proceeds = qty * price;
  h.qty -= qty;
  h.realizedPnl += (price - h.avgPrice) * qty;
  if (h.qty === 0) h.avgPrice = 0;
  user.cash += proceeds;
  saveHolding(userId, h);

  ledgerEntry({ userId, type: "SECURITY_SELL", amount: proceeds, reference, description: `Sold ${qty} ${symbol} @ ${price}` });
}

export function getPortfolioValue(userId, latestPrices = {}) {
  return Object.values(state.portfolios[userId] || {}).map(h => {
    const marketPrice = latestPrices[h.symbol] || h.avgPrice;
    const marketValue = h.qty * marketPrice;
    const unrealizedPnl = (marketPrice - h.avgPrice) * h.qty;
    return { ...h, marketPrice, marketValue, unrealizedPnl, totalPnl: h.realizedPnl + unrealizedPnl };
  });
}
