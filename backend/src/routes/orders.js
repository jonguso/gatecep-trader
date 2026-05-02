import { v4 as uuidv4 } from "uuid";
import { engine } from "../engine/orderBook.js";
import { getUser, getHolding, state } from "../store/state.js";
import { broadcast } from "../ws/market.js";

export function handleOrder(req, res) {
  const { userId, symbol, side, price, qty } = req.body;
  const user = getUser(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  const cleanSide = String(side).toUpperCase(), cleanSymbol = String(symbol || "SCOM").toUpperCase(), cleanPrice = Number(price), cleanQty = Number(qty);
  if (!["BUY", "SELL"].includes(cleanSide)) return res.status(400).json({ error: "side must be BUY or SELL" });
  if (cleanQty <= 0 || cleanPrice <= 0) return res.status(400).json({ error: "price and qty must be positive" });
  if (cleanSide === "BUY" && user.cash < cleanPrice * cleanQty) return res.status(400).json({ error: "Insufficient cash" });
  if (cleanSide === "SELL" && getHolding(userId, cleanSymbol).qty < cleanQty) return res.status(400).json({ error: "Insufficient shares" });
  const order = { id: uuidv4(), userId, symbol: cleanSymbol, side: cleanSide, price: cleanPrice, qty: cleanQty, createdAt: Date.now() };
  const trades = engine.addOrder(order);
  trades.forEach(t => broadcast("trade", t));
  broadcast("orderbook", engine.getOrderBook(cleanSymbol));
  broadcast("account_update", { userId });
  res.json({ order, trades });
}

export function getOrders(req, res) { res.json(state.orderLog.slice(0, 100)); }
export function getAudit(req, res) { res.json(state.auditLog.slice(0, 100)); }
