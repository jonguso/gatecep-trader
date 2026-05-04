import { SECURITIES, STARTING_PRICES } from "../../data/securities.js";

let prices = { ...STARTING_PRICES };

export function tickPrices() {
  for (const symbol of Object.keys(prices)) {
    const large = prices[symbol] > 100;
    prices[symbol] += (Math.random() - 0.5) * (large ? 2.0 : 0.25);
    prices[symbol] = Number(Math.max(0.5, prices[symbol]).toFixed(2));
  }
  return prices;
}

export function getLatestPrices() {
  return prices;
}

export default {
  async getPrices() {
    tickPrices();
    return {
      provider: "SIMULATED",
      delayed: true,
      disclaimer: "Simulated data for demo/testing only.",
      data: SECURITIES.map(s => ({ ...s, price: prices[s.symbol] ?? null, timestamp: new Date().toISOString() }))
    };
  },

  async getCandles(symbol, interval = "1m") {
    const price = prices[symbol] || 15;
    return Array.from({ length: 60 }, (_, i) => {
      const base = price + Math.sin(i / 5) * 1.2 + (Math.random() - 0.5);
      return {
        timestamp: Date.now() - (60 - i) * 60000,
        open: Number(base.toFixed(2)),
        high: Number((base + Math.random()).toFixed(2)),
        low: Number((base - Math.random()).toFixed(2)),
        close: Number((base + (Math.random() - 0.5)).toFixed(2))
      };
    });
  },

  async getMarketSummary() {
    const pricesRes = await this.getPrices();
    const rows = pricesRes.data.map(r => ({ ...r, changePct: Number(((Math.random() - 0.5) * 4).toFixed(2)), volume: Math.floor(1000 + Math.random() * 100000) }));
    return {
      provider: "SIMULATED",
      marketStatus: "DEMO",
      gainers: rows.slice().sort((a, b) => b.changePct - a.changePct).slice(0, 5),
      losers: rows.slice().sort((a, b) => a.changePct - b.changePct).slice(0, 5),
      active: rows.slice().sort((a, b) => b.volume - a.volume).slice(0, 5)
    };
  }
};
