import { marketDataGateway } from "../../services/marketData/MarketDataGateway.js";

let quoteCache = {
  provider: "UNKNOWN",
  marketDate: null,
  generatedAt: null,
  count: 0,
  data: [],
  bySymbol: {}
};

function normalizeSymbol(symbol) {
  return String(symbol || "").toUpperCase().trim();
}

export async function refreshMarketCache() {
  const prices = await marketDataGateway.getPrices();
  const rows = prices?.data || [];

  const bySymbol = {};

  rows.forEach((row) => {
    const symbol = normalizeSymbol(row.symbol);

    if (!symbol) return;

    bySymbol[symbol] = {
      ...row,
      symbol,
      price: Number(row.price || row.lastPrice || 0),
      lastPrice: Number(row.lastPrice || row.price || 0),
      prevClose: Number(row.prevClose || row.previousClose || 0),
      change: Number(row.change || 0),
      changePct: Number(row.changePct || 0),
      volume: Number(row.volume || 0),
      turnover: Number(row.turnover || 0),
      bid: Number(row.bid || 0),
      ask: Number(row.ask || 0),
      priceSource: row.priceSource || prices.provider || "UNKNOWN",
      cachedAt: new Date().toISOString()
    };
  });

  quoteCache = {
    provider: prices?.provider || "UNKNOWN",
    marketDate: prices?.marketDate || null,
    generatedAt: new Date().toISOString(),
    count: rows.length,
    data: Object.values(bySymbol),
    bySymbol
  };

  return getMarketCache();
}

export function getMarketCache() {
  return {
    provider: quoteCache.provider,
    marketDate: quoteCache.marketDate,
    generatedAt: quoteCache.generatedAt,
    count: quoteCache.count,
    data: quoteCache.data
  };
}

export function getCachedQuote(symbol) {
  return quoteCache.bySymbol[normalizeSymbol(symbol)] || null;
}

export function getCachedQuotes(symbols = []) {
  return symbols.map((symbol) => getCachedQuote(symbol)).filter(Boolean);
}

export function getMarketCacheStatus() {
  return {
    ok: true,
    provider: quoteCache.provider,
    marketDate: quoteCache.marketDate,
    generatedAt: quoteCache.generatedAt,
    count: quoteCache.count,
    ready: quoteCache.count > 0,
    version: "MarketCache-019A"
  };
}