/**
 * ============================================================================
 * STATUS: DEV
 * MODULE: Shared Market Selectors
 * MODULE ID: MKT-001
 * PURPOSE: Normalize market rows and select latest prices by symbol.
 * LAST VERIFIED: 2026-06-29
 * ============================================================================
 */

export function normalizeSymbol(symbol) {
  return String(symbol || "").trim().toUpperCase();
}

export function buildPriceMap(rows = []) {
  const map = {};

  rows.forEach((row) => {
    const symbol = normalizeSymbol(row.symbol);
    if (!symbol) return;

    map[symbol] = {
      symbol,
      name: row.name || row.company || symbol,
      sector: row.sector || "Unknown",
      price: Number(row.price || row.lastPrice || row.currentPrice || 0),
      lastPrice: Number(row.lastPrice || row.price || row.currentPrice || 0),
      change: Number(row.change || 0),
      changePct: Number(row.changePct || 0),
      volume: Number(row.volume || 0),
      updatedAt: row.updatedAt || row.generatedAt || null,
      provider: row.provider || "UNKNOWN"
    };
  });

  return map;
}

export function getLatestPrice(priceMap = {}, symbol, fallback = 0) {
  const item = priceMap[normalizeSymbol(symbol)];
  return Number(item?.price || item?.lastPrice || fallback || 0);
}

export function enrichSecurityWithPrice(security, priceMap = {}) {
  const symbol = normalizeSymbol(security?.symbol);
  const market = priceMap[symbol] || {};

  return {
    ...security,
    symbol,
    marketPrice: Number(market.price || security?.marketPrice || security?.price || 0),
    price: Number(market.price || security?.price || 0),
    change: Number(market.change || 0),
    changePct: Number(market.changePct || 0),
    marketProvider: market.provider || "UNKNOWN"
  };
}