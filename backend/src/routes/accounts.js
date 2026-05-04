import { state, getUser, getPortfolioValue } from "../store/state.js";
import { latestPrices } from "../services/marketData.js";

export function getUsers(req, res) { res.json(state.users.map(({ password, ...u }) => u)); }

export function getAccount(req, res) {
  const user = getUser(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  const portfolio = getPortfolioValue(user.id, latestPrices);
  const holdingsValue = portfolio.reduce((s, h) => s + h.marketValue, 0);
  const totalPnl = portfolio.reduce((s, h) => s + h.totalPnl, 0);
  res.json({ user: { ...user, password: undefined }, cash: user.cash, holdingsValue, equity: user.cash + holdingsValue, totalPnl, buyingPower: user.cash });
}

export function getPortfolio(req, res) {
  const user = getUser(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(getPortfolioValue(user.id, latestPrices));
}
