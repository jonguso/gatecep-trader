import { marketDataGateway } from "../services/marketData/MarketDataGateway.js";
import { getBalances } from "../services/accounting/accountingEngine.js";
import { getPriceBand } from "../services/trading/priceBands.js";
import { buildTradeRecommendation } from "../ai/tradeSignals.js";
import { state } from "../store/state.js";

function hasDuplicateOrder({ userId, symbol, side, qty, price }) {
  return (state.orderLog || []).some(o =>
    ["PENDING","OPEN","ROUTED","ACCEPTED","NEW"].includes(String(o.status).toUpperCase()) &&
    o.userId === userId && o.symbol === symbol && o.side === side &&
    Number(o.qty) === Number(qty) && Number(o.price) === Number(price)
  );
}

export async function getTradeRecommendation(req, res) {
  const { userId="u1", symbol, side="BUY", price, qty, cashRequired } = req.body;
  const prices = await marketDataGateway.getPrices();
  const market = prices.data.find(x => x.symbol === symbol) || {};
  const referencePrice = Number(market.offerPrice || market.price || price);
  const priceBand = getPriceBand({ referencePrice });
  const balances = getBalances(userId);
  balances.cashRequired = Number(cashRequired || price * qty);
  const duplicate = hasDuplicateOrder({ userId, symbol, side, qty, price });
  res.json(buildTradeRecommendation({ symbol, side, price, qty, market, balances, priceBand, duplicate }));
}
