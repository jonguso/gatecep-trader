const symbols = ["SCOM", "EQTY", "KCB", "COOP"];

const prices = {
  SCOM: 30.60,
  EQTY: 75.20,
  KCB: 67.50,
  COOP: 31.50
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