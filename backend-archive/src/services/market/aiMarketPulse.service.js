import { marketDataGateway } from "../marketData/MarketDataGateway.js";

function sentimentFromBreadth(gainers, losers) {
  if (gainers > losers * 1.5) {
    return "BULLISH";
  }

  if (losers > gainers * 1.5) {
    return "BEARISH";
  }

  return "NEUTRAL";
}

function riskFromBreadth(sentiment, losersCount) {
  if (sentiment === "BEARISH") {
    return "HIGH";
  }

  if (losersCount >= 10) {
    return "MEDIUM";
  }

  return "LOW";
}

export async function getAIMarketPulse() {
  const prices = await marketDataGateway.getPrices();
  const rows = prices.data || [];

  const gainers = rows.filter(
    (item) => Number(item.changePct || 0) > 0
  );

  const losers = rows.filter(
    (item) => Number(item.changePct || 0) < 0
  );

  const unchanged = rows.filter(
    (item) => Number(item.changePct || 0) === 0
  );

  const topGainers = [...rows]
    .sort(
      (a, b) =>
        Number(b.changePct || 0) -
        Number(a.changePct || 0)
    )
    .slice(0, 5);

  const topLosers = [...rows]
    .sort(
      (a, b) =>
        Number(a.changePct || 0) -
        Number(b.changePct || 0)
    )
    .slice(0, 5);

  const turnoverLeaders = [...rows]
    .sort(
      (a, b) =>
        Number(b.turnover || 0) -
        Number(a.turnover || 0)
    )
    .slice(0, 5);

  const totalTurnover = rows.reduce(
    (sum, item) =>
      sum + Number(item.turnover || 0),
    0
  );

  const sentiment = sentimentFromBreadth(
    gainers.length,
    losers.length
  );

  const riskLevel = riskFromBreadth(
    sentiment,
    losers.length
  );

  const liquidityScore =
    totalTurnover >= 1000000000
      ? 90
      : totalTurnover >= 500000000
      ? 75
      : totalTurnover >= 100000000
      ? 60
      : 45;

  return {
    provider: prices.provider,
    marketSentiment: sentiment,
    riskLevel,
    liquidityScore,
    breadth: {
      gainers: gainers.length,
      losers: losers.length,
      unchanged: unchanged.length,
      total: rows.length
    },
    totalTurnover: Number(totalTurnover.toFixed(2)),
    topGainers,
    topLosers,
    turnoverLeaders,
    coachGSummary:
      sentiment === "BULLISH"
        ? "Coach G detects broad buying strength across the NSE with improving liquidity."
        : sentiment === "BEARISH"
        ? "Coach G detects weak market breadth. Risk control and selective entries are recommended."
        : "Coach G sees a balanced market. Focus on high-liquidity names and avoid chasing weak momentum.",
    generatedAt: new Date().toISOString()
  };
}