import { SECURITIES, STARTING_PRICES } from "../data/securities.js";

export let latestPrices = { ...STARTING_PRICES };
export let priceMeta = {
  mode: process.env.MARKET_DATA_MODE || "PUBLIC_DELAYED",
  source: process.env.PUBLIC_PRICE_URL || "https://afx.kwayisi.org/nse/",
  lastUpdated: new Date().toISOString(),
  fallback: "simulated-demo"
};

export function simulateTick() {
  for (const symbol of Object.keys(latestPrices)) {
    const large = latestPrices[symbol] > 100;
    latestPrices[symbol] += (Math.random() - 0.5) * (large ? 2.0 : 0.25);
    latestPrices[symbol] = Number(Math.max(0.5, latestPrices[symbol]).toFixed(2));
  }
  priceMeta.lastUpdated = new Date().toISOString();
}

export async function refreshPublicDelayedPrices() {
  simulateTick();
  return latestPrices;
}

export function getAllPrices() {
  return SECURITIES.map(s => ({ ...s, price: latestPrices[s.symbol] ?? null }));
}
