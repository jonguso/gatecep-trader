import { NSE_SECURITIES } from "./nseSecurities.js";

export function normalizeNseSymbol(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9]/g, "")
    .trim();
}

export function getSecurityBySymbol(symbol) {
  const value = normalizeNseSymbol(symbol);

  return (
    NSE_SECURITIES.find((item) => normalizeNseSymbol(item.symbol) === value) || {
      symbol: value,
      name: value,
      sector: "Unknown"
    }
  );
}

export function applySecurityMaster(row = {}) {
  const symbol = normalizeNseSymbol(row.symbol || row.code || "");
  const security = getSecurityBySymbol(symbol);

  return {
    ...row,
    symbol: security.symbol,
    name: row.name || security.name,
    sector: row.sector || security.sector
  };
}