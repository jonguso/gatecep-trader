export const state = {
  users: [
    { id: "u1", name: "Demo Trader", cash: 100000 },
    { id: "u2", name: "Market Maker", cash: 1000000 }
  ],
  portfolios: { u1: {}, u2: {} },
  orderLog: [],
  auditLog: []
};

export function getUser(userId) { return state.users.find(u => u.id === userId); }
export function getHolding(userId, symbol) { return state.portfolios[userId]?.[symbol] || { symbol, qty: 0, avgPrice: 0, realizedPnl: 0 }; }
export function saveHolding(userId, holding) { if (!state.portfolios[userId]) state.portfolios[userId] = {}; state.portfolios[userId][holding.symbol] = holding; }

export function applyBuy(userId, symbol, qty, price) {
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
}

export function applySell(userId, symbol, qty, price) {
  const user = getUser(userId);
  if (!user) throw new Error("User not found");
  const h = getHolding(userId, symbol);
  if (h.qty < qty) throw new Error("Insufficient shares");
  h.qty -= qty;
  h.realizedPnl += (price - h.avgPrice) * qty;
  if (h.qty === 0) h.avgPrice = 0;
  user.cash += qty * price;
  saveHolding(userId, h);
}

export function getPortfolioValue(userId, latestPrices = {}) {
  return Object.values(state.portfolios[userId] || {}).map(h => {
    const marketPrice = latestPrices[h.symbol] || h.avgPrice;
    const marketValue = h.qty * marketPrice;
    const unrealizedPnl = (marketPrice - h.avgPrice) * h.qty;
    return { ...h, marketPrice, marketValue, unrealizedPnl, totalPnl: h.realizedPnl + unrealizedPnl };
  });
}
