import { latestPrices } from "../services/marketData.js";

const candleStore = {};

export function updateCandlesFromPrice(symbol, price) {
  const intervalMs = 60 * 1000;
  const bucket = Math.floor(Date.now() / intervalMs) * intervalMs;
  if (!candleStore[symbol]) candleStore[symbol] = [];
  let candle = candleStore[symbol].find(c => c.timestamp === bucket);
  if (!candle) {
    candle = { timestamp: bucket, open: price, high: price, low: price, close: price };
    candleStore[symbol].push(candle);
  } else {
    candle.high = Math.max(candle.high, price);
    candle.low = Math.min(candle.low, price);
    candle.close = price;
  }
  candleStore[symbol] = candleStore[symbol].slice(-100);
}

export function getCandles(req, res) {
  const symbol = String(req.params.symbol || "SCOM").toUpperCase();
  if (!candleStore[symbol]) {
    const price = latestPrices[symbol] || 15;
    candleStore[symbol] = Array.from({ length: 32 }, (_, i) => {
      const base = price + (Math.random() - 0.5) * 2;
      return {
        timestamp: Date.now() - (32 - i) * 60000,
        open: Number(base.toFixed(2)),
        high: Number((base + Math.random()).toFixed(2)),
        low: Number((base - Math.random()).toFixed(2)),
        close: Number((base + (Math.random() - 0.5)).toFixed(2))
      };
    });
  }
  res.json(candleStore[symbol]);
}
