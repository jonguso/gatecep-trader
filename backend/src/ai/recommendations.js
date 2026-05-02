import { engine } from "../engine/orderBook.js";
import { getPortfolioValue } from "../store/state.js";
import { latestPrices } from "../services/publicMarketData.js";

export function generateRecommendation(symbol = "SCOM", userId = "u1") {
  symbol = String(symbol).toUpperCase();
  const book = engine.getOrderBook(symbol);
  const totalBids = book.bids.reduce((s, b) => s + b.qty, 0);
  const totalAsks = book.asks.reduce((s, a) => s + a.qty, 0);
  const bestBid = book.bids[0]?.price || 0, bestAsk = book.asks[0]?.price || 0;
  const spread = bestBid && bestAsk ? bestAsk - bestBid : 0;
  let score = 50;
  if (totalBids > totalAsks) score += 15;
  if (totalBids > totalAsks * 1.5) score += 10;
  if (totalAsks > totalBids) score -= 15;
  if (spread > 0.5) score -= 10;
  const portfolio = getPortfolioValue(userId, latestPrices);
  const totalValue = portfolio.reduce((s, h) => s + h.marketValue, 0);
  const holding = portfolio.find(h => h.symbol === symbol);
  const exposure = totalValue > 0 && holding ? holding.marketValue / totalValue : 0;
  if (exposure > 0.6) score -= 20;
  score = Math.max(0, Math.min(100, Math.round(score)));
  const action = score >= 70 ? "BUY" : score <= 35 ? "SELL" : "WAIT";
  let message = action === "BUY" ? "Buying pressure is stronger. Coach G suggests a small, controlled buy position."
    : action === "SELL" ? "Selling pressure is elevated. Coach G suggests reducing exposure or waiting before adding more."
    : "Market is balanced. Coach G suggests waiting for a clearer signal.";
  if (exposure > 0.6) message += " Your portfolio is concentrated in this stock, so avoid going all-in.";
  return { coach: "Coach G", symbol, action, confidence: score, buyPressure: totalBids, sellPressure: totalAsks, spread: Number(spread.toFixed(2)), exposure: Number((exposure * 100).toFixed(1)), message };
}
