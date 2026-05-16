const marketMetadata = {
  SCOM: {
    symbol: "SCOM",
    name: "Safaricom PLC",
    sector: "Telecommunications"
  },
  KCB: {
    symbol: "KCB",
    name: "KCB Group PLC",
    sector: "Banking"
  },
  EQTY: {
    symbol: "EQTY",
    name: "Equity Group Holdings PLC",
    sector: "Banking"
  },
  COOP: {
    symbol: "COOP",
    name: "Co-operative Bank of Kenya",
    sector: "Banking"
  }
};

export function getMarketMetadata(symbol) {
  return (
    marketMetadata[symbol] || {
      symbol,
      name: symbol,
      sector: "Unknown"
    }
  );
}