const symbols = ["SCOM", "EQTY", "KCB", "COOP"];

const prices = {
  SCOM: 18.45,
  EQTY: 47.2,
  KCB: 31.8,
  COOP: 15.6
};

export function generateMarketTick() {
  return symbols.map((symbol) => {
    const oldPrice = prices[symbol];

    const move = Number((Math.random() * 0.4 - 0.2).toFixed(2));
    const newPrice = Number(Math.max(1, oldPrice + move).toFixed(2));

    prices[symbol] = newPrice;

    return {
      symbol,
      price: newPrice,
      change: Number((newPrice - oldPrice).toFixed(2)),
      changePct: Number((((newPrice - oldPrice) / oldPrice) * 100).toFixed(2)),
      timestamp: new Date().toISOString()
    };
  });
}