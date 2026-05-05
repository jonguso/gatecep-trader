export const state = {
  users: {
    u1: { id: "u1", name: "Demo User", cash: 100000 }
  },
  holdings: {
    u1: []
  },
  orderLog: [],
  ledger: [],
  cashLocks: []
};

export function getUser(userId) {
  return state.users[userId];
}

export function getHolding(userId, symbol) {
  if (!state.holdings[userId]) state.holdings[userId] = [];
  let h = state.holdings[userId].find(x => x.symbol === symbol);
  if (!h) {
    h = { symbol, qty: 0, avgPrice: 0, realizedPnl: 0 };
    state.holdings[userId].push(h);
  }
  return h;
}

export function saveHolding(userId, holding) {
  if (!state.holdings[userId]) state.holdings[userId] = [];
  const idx = state.holdings[userId].findIndex(x => x.symbol === holding.symbol);
  if (idx >= 0) state.holdings[userId][idx] = holding;
  else state.holdings[userId].push(holding);
}

export function audit(type, message, userId, metadata = {}) {
  console.log("[AUDIT]", { type, message, userId, metadata, at: new Date().toISOString() });
}
