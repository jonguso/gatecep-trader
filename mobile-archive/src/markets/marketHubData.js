export const MARKET_TABS = [
  "Summary",
  "Equities",
  "Gainers",
  "Losers",
  "Volume",
  "Turnover"
];

export const MARKET_ROWS = [
  { symbol: "SCOM", name: "Safaricom", price: 31.75, change: 0.4, changePct: 1.28, volume: 8442353, turnover: 268057839 },
  { symbol: "EABL", name: "East African Breweries", price: 258.25, change: 5.75, changePct: 2.28, volume: 120394, turnover: 31012200 },
  { symbol: "EQTY", name: "Equity Group Holdings", price: 77.25, change: 0.25, changePct: 0.32, volume: 3826724, turnover: 295912357 },
  { symbol: "COOP", name: "Co-operative Bank of Kenya", price: 31.35, change: -0.55, changePct: -1.72, volume: 2346287, turnover: 73592192 },
  { symbol: "KCB", name: "KCB Group", price: 70.75, change: 0.75, changePct: 1.07, volume: 1860200, turnover: 131755191 },
  { symbol: "ABSA", name: "ABSA Bank Kenya", price: 29.3, change: 0.5, changePct: 1.74, volume: 475900, turnover: 13943870 },
  { symbol: "BAT", name: "British American Tobacco Kenya", price: 516, change: -1, changePct: -0.19, volume: 17027, turnover: 8785932 },
  { symbol: "BAMB", name: "Bamburi Cement", price: 47.2, change: 0, changePct: 0, volume: 90000, turnover: 4248000 },
  { symbol: "BOC", name: "BOC Kenya", price: 166.5, change: 0, changePct: 0, volume: 481, turnover: 80086.5 },
  { symbol: "CIC", name: "CIC Insurance Group", price: 4.2, change: -0.02, changePct: -0.47, volume: 68947, turnover: 289577.4 }
];

export const INDEX_ROWS = [
  {
    symbol: "^NASI",
    name: "NSE All Share Index",
    value: 211.57,
    change: 0.46,
    changePct: 0.22,
    trend: "UP"
  },
  {
    symbol: "^N20",
    name: "NSE 20 Share Index",
    value: 3568.33,
    change: 6.51,
    changePct: 0.18,
    trend: "UP"
  },
  {
    symbol: "^N25",
    name: "NSE 25 Share Index",
    value: 5838.13,
    change: 24.54,
    changePct: 0.42,
    trend: "UP"
  },
  {
    symbol: "^NBDI",
    name: "NSE Bonds Index",
    value: 1122.24,
    change: -4.28,
    changePct: -0.38,
    trend: "DOWN"
  }
];

export function getMarketSummary() {
  const gainers = MARKET_ROWS.filter((row) => row.changePct > 0).length;
  const decliners = MARKET_ROWS.filter((row) => row.changePct < 0).length;

  const turnover = MARKET_ROWS.reduce(
    (sum, row) => sum + Number(row.turnover || 0),
    0
  );

  const volume = MARKET_ROWS.reduce(
    (sum, row) => sum + Number(row.volume || 0),
    0
  );

  return {
    turnover,
    volume,
    deals: 9532,
    gainers,
    decliners,
    breadth: gainers >= decliners ? "Positive" : "Weak",
    foreignActivity: "Neutral",
    avgTradeSize: turnover / Math.max(volume, 1)
  };
}

export function getRowsForTab(tab) {
  if (tab === "Gainers") {
    return [...MARKET_ROWS].filter((row) => row.changePct > 0).sort((a, b) => b.changePct - a.changePct);
  }

  if (tab === "Losers") {
    return [...MARKET_ROWS].filter((row) => row.changePct < 0).sort((a, b) => a.changePct - b.changePct);
  }

  if (tab === "Volume") {
    return [...MARKET_ROWS].sort((a, b) => b.volume - a.volume);
  }

  if (tab === "Turnover") {
    return [...MARKET_ROWS].sort((a, b) => b.turnover - a.turnover);
  }

  return MARKET_ROWS;
}