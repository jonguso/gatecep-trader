import { state, getUser, getPortfolioValue } from "../store/state.js";
import { getLatestPrices } from "../services/marketData/SimulatedDataAdapter.js";

export function getUsers(req, res) { res.json(state.users.map(({ password, ...u }) => u)); }

export function getAccount(req, res) {
  const user = getUser(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  const portfolio = getPortfolioValue(user.id, getLatestPrices());
  const holdingsValue = portfolio.reduce((s, h) => s + h.marketValue, 0);
  const totalPnl = portfolio.reduce((s, h) => s + h.totalPnl, 0);
  const { password, ...safeUser } = user;
  res.json({ user: safeUser, cash: user.cash, holdingsValue, equity: user.cash + holdingsValue, totalPnl, buyingPower: user.cash });
}

export function getPortfolio(req, res) {
  const user = getUser(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(getPortfolioValue(user.id, getLatestPrices()));
}
