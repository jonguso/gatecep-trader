import { v4 as uuidv4 } from "uuid";
import { state } from "../store/state.js";
import { marketDataGateway } from "../services/marketData/MarketDataGateway.js";
import { validateLimitPrice } from "../services/trading/priceBands.js";
import { postBuyExecution, postSellExecution } from "../services/accounting/accountingEngine.js";

export async function placeOrder(req, res) {
  try {
    const { userId="u1", symbol, side, price, qty } = req.body;
    const cleanSymbol = String(symbol).toUpperCase();
    const cleanSide = String(side).toUpperCase();
    const cleanPrice = Number(price);
    const cleanQty = Number(qty);

    const prices = await marketDataGateway.getPrices();
    const market = prices.data.find(x => x.symbol === cleanSymbol);
    const referencePrice = Number(market?.offerPrice || market?.price || cleanPrice);
    const priceValidation = validateLimitPrice({ side: cleanSide, price: cleanPrice, referencePrice });

    if (!priceValidation.ok) {
      return res.status(400).json({ error: priceValidation.error, priceBand: priceValidation.band });
    }

    const order = {
      id: uuidv4(),
      userId,
      symbol: cleanSymbol,
      side: cleanSide,
      price: cleanPrice,
      qty: cleanQty,
      status: "ACCEPTED",
      brokerId: "mock-broker",
      submittedAt: new Date().toISOString()
    };

    let accounting = cleanSide === "BUY"
      ? postBuyExecution({ userId, symbol: cleanSymbol, qty: cleanQty, price: cleanPrice, orderId: order.id })
      : postSellExecution({ userId, symbol: cleanSymbol, qty: cleanQty, price: cleanPrice, orderId: order.id });

    state.orderLog.unshift(order);
    res.json({ message: "Order routed to selected broker", order, accounting, priceBand: priceValidation.band });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export function listOrders(req, res) {
  const userId = req.query.userId;
  res.json((state.orderLog || []).filter(x => !userId || x.userId === userId));
}
