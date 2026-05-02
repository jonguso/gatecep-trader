import { v4 as uuidv4 } from "uuid";
import { state, getUser, getPortfolioValue } from "../store/state.js";
import { latestPrices } from "../services/publicMarketData.js";

export function getUsers(req, res) { res.json(state.users); }
export function createUser(req, res) {
  const user = { id: uuidv4(), name: req.body.name || "Trader", cash: Number(req.body.startingCash || 100000) };
  state.users.push(user); state.portfolios[user.id] = {}; res.json(user);
}
export function getAccount(req, res) {
  const user = getUser(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  const portfolio = getPortfolioValue(user.id, latestPrices);
  const holdingsValue = portfolio.reduce((s, h) => s + h.marketValue, 0);
  const totalPnl = portfolio.reduce((s, h) => s + h.totalPnl, 0);
  res.json({ user, cash: user.cash, holdingsValue, equity: user.cash + holdingsValue, totalPnl, buyingPower: user.cash });
}
export function getPortfolio(req, res) {
  const user = getUser(req.params.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(getPortfolioValue(user.id, latestPrices));
}
export function depositCash(req, res) {
  const user = getUser(req.body.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.cash += Number(req.body.amount);
  state.auditLog.unshift({ time: new Date().toISOString(), event: "FUNDS_DEPOSIT", detail: `Deposit KES ${req.body.amount} for ${user.name}` });
  res.json({ message: "Deposit successful", user });
}
