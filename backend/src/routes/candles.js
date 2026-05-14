export const candleStore = {};

const fallbackPrices = {
  SCOM: 25,
  KCB: 66.8,
  EQTY: 52,
  COOP: 15.5,
  EABL: 185,
  BAT: 410
};

export function updateCandlesFromPrice(symbol, price) {
  const intervalMs = 60 * 1000;
  const bucket =
    Math.floor(Date.now() / intervalMs) * intervalMs;

  if (!candleStore[symbol]) {
    candleStore[symbol] = [];
  }

  let candle = candleStore[symbol].find(
    (item) => item.timestamp === bucket
  );

  if (!candle) {
    candle = {
      timestamp: bucket,
      open: price,
      high: price,
      low: price,
      close: price
    };

    candleStore[symbol].push(candle);
  } else {
    candle.high = Math.max(candle.high, price);
    candle.low = Math.min(candle.low, price);
    candle.close = price;
  }

  candleStore[symbol] =
    candleStore[symbol].slice(-100);
}

export function getCandles(req, res) {
  const symbol =
    String(req.params.symbol || "SCOM").toUpperCase();

  if (!candleStore[symbol]) {
    const price =
      fallbackPrices[symbol] || 100;

    candleStore[symbol] = Array.from(
      { length: 40 },
      (_, index) => {
        const base =
          price + (Math.random() - 0.5) * 6;

        const open = base;
        const high = base + Math.random() * 4;
        const low = base - Math.random() * 4;
        const close =
          low + Math.random() * (high - low);

        return {
          timestamp:
            Date.now() - (40 - index) * 60000,
          open: Number(open.toFixed(2)),
          high: Number(high.toFixed(2)),
          low: Number(low.toFixed(2)),
          close: Number(close.toFixed(2))
        };
      }
    );
  }

  res.json(candleStore[symbol]);
}