const DEFAULT_WATCHLIST = [
  { symbol: "SCOM", name: "Safaricom", sector: "Telecom", price: 30.6 },
  { symbol: "KCB", name: "KCB Group", sector: "Banking", price: 45 },
  { symbol: "EQTY", name: "Equity Group", sector: "Banking", price: 48 },
  { symbol: "COOP", name: "Co-operative Bank", sector: "Banking", price: 16 },
  { symbol: "EABL", name: "East African Breweries", sector: "Mfg. and Allied", price: 248 },
  { symbol: "BAT", name: "BAT Kenya", sector: "Mfg. and Allied", price: 520 },
  { symbol: "KEGN", name: "KenGen", sector: "Energy and Petroleum", price: 45.5 },
  { symbol: "KQ", name: "Kenya Airways", sector: "Comm. and Services", price: 3.8 }
];

export function getDefaultWatchlist() {
  return DEFAULT_WATCHLIST;
}

export function generateWatchlistSignals(items = []) {
  return items.map((item) => {
    const changePct = Number(((Math.random() - 0.45) * 6).toFixed(2));
    const currentPrice = Number((Number(item.price || 0) * (1 + changePct / 100)).toFixed(2));

    let signal = "WATCH";
    let reason = "Price movement is normal. Keep watching.";

    if (changePct >= 3) {
      signal = "HOT";
      reason = "Strong upward movement. Avoid chasing; wait for confirmation.";
    } else if (changePct <= -3) {
      signal = "OPPORTUNITY";
      reason = "Price dropped meaningfully. Review fundamentals before buying.";
    } else if (changePct >= 1) {
      signal = "POSITIVE";
      reason = "Mild positive movement with stable trend.";
    } else if (changePct <= -1) {
      signal = "CAUTION";
      reason = "Mild weakness. Watch before committing new cash.";
    }

    return {
      ...item,
      currentPrice,
      changePct,
      signal,
      reason,
      updatedAt: new Date().toISOString()
    };
  });
}