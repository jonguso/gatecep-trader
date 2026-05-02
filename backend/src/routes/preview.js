import { engine } from "../engine/orderBook.js";
export function handlePreview(req, res) {
  const { side, qty, symbol = "SCOM" } = req.body;
  const levels = String(side).toUpperCase() === "BUY" ? engine.getOrderBook(symbol).asks : engine.getOrderBook(symbol).bids;
  let remaining = Number(qty), filled = 0, cost = 0;
  for (const level of levels) { const takeQty = Math.min(remaining, level.qty); filled += takeQty; cost += takeQty * level.price; remaining -= takeQty; if (remaining <= 0) break; }
  if (!filled) return res.json({ fillable: false, message: "No liquidity available" });
  const avgFillPrice = cost / filled, bestPrice = levels[0]?.price || 0;
  const slippage = String(side).toUpperCase() === "BUY" ? ((avgFillPrice - bestPrice) / bestPrice) * 100 : ((bestPrice - avgFillPrice) / bestPrice) * 100;
  res.json({ fillable: remaining === 0, requestedQty: Number(qty), filledQty: filled, unfilledQty: remaining, bestPrice, avgFillPrice: Number(avgFillPrice.toFixed(2)), estimatedCost: Number(cost.toFixed(2)), slippagePercent: Number(slippage.toFixed(3)) });
}
