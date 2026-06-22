export const NEWS_TABS = ["Market", "Company", "Dividends", "Coach G"];

export const NEWS_ROWS = [
  {
    id: "NEWS-001",
    category: "Market",
    symbol: "NSE",
    title: "NSE market turnover remains active",
    source: "GateCEP Market Desk",
    date: "2026-06-17",
    detail: "Market activity remains concentrated in large-cap counters."
  },
  {
    id: "NEWS-002",
    category: "Company",
    symbol: "SCOM",
    title: "Safaricom remains a key retail investor counter",
    source: "GateCEP Market Desk",
    date: "2026-06-17",
    detail: "Coach G continues to monitor telecom exposure and dividend contribution."
  },
  {
    id: "NEWS-003",
    category: "Dividends",
    symbol: "EABL",
    title: "Dividend watchlist updated for income investors",
    source: "GateCEP Income Desk",
    date: "2026-06-17",
    detail: "Investors should track book closure and payment dates."
  },
  {
    id: "NEWS-004",
    category: "Coach G",
    symbol: "PORTFOLIO",
    title: "Coach G: watch sector concentration",
    source: "Coach G",
    date: "2026-06-17",
    detail: "Portfolio recommendations will prioritize diversification and cash readiness."
  }
];

export function getNewsForTab(tab) {
  return NEWS_ROWS.filter((item) => item.category === tab);
}

export function getNewsSummary() {
  return {
    market: NEWS_ROWS.filter((n) => n.category === "Market").length,
    company: NEWS_ROWS.filter((n) => n.category === "Company").length,
    dividends: NEWS_ROWS.filter((n) => n.category === "Dividends").length,
    coachG: NEWS_ROWS.filter((n) => n.category === "Coach G").length
  };
}