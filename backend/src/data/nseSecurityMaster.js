export const NSE_SECURITIES = [
  { symbol: "SCOM", name: "Safaricom PLC", sector: "Telecom" },
  { symbol: "KCB", name: "KCB Group", sector: "Banking" },
  { symbol: "COOP", name: "Co-operative Bank", sector: "Banking" },
  { symbol: "EQT", name: "Equity Group", sector: "Banking" },
  { symbol: "EABL", name: "East African Breweries", sector: "Manufacturing" },
  { symbol: "ABSA", name: "Absa Bank Kenya", sector: "Banking" },
  { symbol: "BAT", name: "BAT Kenya", sector: "Manufacturing" },
  { symbol: "KPLC", name: "Kenya Power", sector: "Energy" },
  { symbol: "SMWF", name: "Sanlam MSCI World ETF", sector: "ETF" }
];

export const nseSecurityMaster = NSE_SECURITIES;

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

export default NSE_SECURITIES;