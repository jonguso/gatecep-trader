import { v4 as uuidv4 } from "uuid";
import { brokerGateway } from "../services/broker/BrokerGateway.js";
import { requireApprovedKyc } from "../services/compliance/KycService.js";
import { validatePreTradeRisk } from "../services/risk/RiskService.js";
import { engine } from "../engine/orderBook.js";
import { getBroker } from "../data/brokers.js";
import { getUser, getHolding, getUserBrokerLink, state, audit, applyBuy, applySell } from "../store/state.js";
import { broadcast } from "../ws/market.js";

export async function handleOrder(req, res) {
  try {
    const { userId, symbol, side, price, qty, orderType = "LIMIT", brokerId } = req.body;
    const user = getUser(userId);
    requireApprovedKyc(user);

    const selectedBrokerId = brokerId || user.selectedBrokerId || "mock-broker";
    const broker = getBroker(selectedBrokerId);
    const link = getUserBrokerLink(userId, selectedBrokerId);

    if (!broker) return res.status(404).json({ error: "Broker not found" });
    if (!link) return res.status(400).json({ error: "Connect or select broker before trading" });
    if (link.status !== "VERIFIED" && broker.id !== "mock-broker") return res.status(403).json({ error: "Broker link must be verified before trading" });

    const cleanSide = String(side).toUpperCase();
    const cleanSymbol = String(symbol || "SCOM").toUpperCase();
    const cleanPrice = Number(price);
    const cleanQty = Number(qty);

    if (!["BUY", "SELL"].includes(cleanSide)) return res.status(400).json({ error: "side must be BUY or SELL" });
    if (cleanQty <= 0 || cleanPrice <= 0) return res.status(400).json({ error: "price and qty must be positive" });
    if (cleanSide === "SELL" && getHolding(userId, cleanSymbol).qty < cleanQty) return res.status(400).json({ error: "Insufficient shares" });

    const risk = validatePreTradeRisk({ user, side: cleanSide, price: cleanPrice, qty: cleanQty, broker });

    const order = {
      id: uuidv4(),
      userId,
      brokerId: selectedBrokerId,
      brokerCustomerId: link.brokerCustomerId || user.brokerCustomerId,
      cdsAccount: link.cdsAccount || user.cdsAccount,
      symbol: cleanSymbol,
      side: cleanSide,
      price: cleanPrice,
      qty: cleanQty,
      orderType,
      createdAt: Date.now()
    };

    const brokerResponse = await brokerGateway.placeOrder(order);

    state.orderLog.unshift({
      ...order,
      originalQty: cleanQty,
      status: brokerResponse.brokerStatus || "ROUTED",
      brokerOrderId: brokerResponse.brokerOrderId,
      brokerMode: brokerResponse.brokerMode,
      submittedAt: new Date().toISOString()
    });

    audit("ORDER_ROUTED_TO_BROKER", `${cleanSide} ${cleanQty} ${cleanSymbol} via ${broker.name}`, userId, { risk, brokerResponse });

    let trades = [];
    if (selectedBrokerId === "mock-broker") {
  if (cleanSide === "BUY") {
    applyBuy(userId, cleanSymbol, cleanQty, cleanPrice, order.id);
  } else {
    applySell(userId, cleanSymbol, cleanQty, cleanPrice, order.id);
  }

  trades = [{
    symbol: cleanSymbol,
    side: cleanSide,
    price: cleanPrice,
    qty: cleanQty,
    userId,
    brokerId: selectedBrokerId,
    timestamp: Date.now()
  }];

  broadcast("trade", trades[0]);
  broadcast("account_update", { userId });
}

    res.json({ message: "Order routed to selected broker", broker, order, risk, brokerResponse, trades });
  } catch (err) {
    res.status(err.statusCode || 400).json({ error: err.message });
  }
}

export function getOrders(req, res) {
  const userId = req.query.userId;
  const rows = userId ? state.orderLog.filter(o => o.userId === userId) : state.orderLog;
  res.json(rows.slice(0, 250));
}

export function getAudit(req, res) { res.json(state.auditLog.slice(0, 250)); }
