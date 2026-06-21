import { SECURITIES, STARTING_PRICES } from "../data/securities.js";

export let latestPrices = { ...STARTING_PRICES };

export async function refreshPrices() {
  for (const symbol of Object.keys(latestPrices)) {
    const large = latestPrices[symbol] > 100;
    latestPrices[symbol] += (Math.random() - 0.5) * (large ? 2.0 : 0.25);
    latestPrices[symbol] = Number(Math.max(0.5, latestPrices[symbol]).toFixed(2));
  }
  return latestPrices;
}

export function getAllPrices() {
  return SECURITIES.map(s => ({ ...s, price: latestPrices[s.symbol] ?? null }));
}

export function getMarketSummary() {
  const rows = getAllPrices().map(r => ({
    ...r,
    changePct: Number(((Math.random() - 0.5) * 4).toFixed(2)),
    volume: Math.floor(1000 + Math.random() * 100000)
  }));
  return {
    marketStatus: "OPEN / DEMO",
    indexName: "GATECEP NSE Demo Index",
    indexValue: Number((3500 + Math.random() * 80).toFixed(2)),
    gainers: rows.slice().sort((a, b) => b.changePct - a.changePct).slice(0, 5),
    losers: rows.slice().sort((a, b) => a.changePct - b.changePct).slice(0, 5),
    active: rows.slice().sort((a, b) => b.volume - a.volume).slice(0, 5)
  };
}
