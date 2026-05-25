import { getUnifiedPortfolio } from "../portfolio/unifiedPortfolio.service.js";

function getAction(exposure, pnl) {
  if (exposure >= 45) {
    return "REDUCE";
  }

  if (exposure >= 30) {
    return "TRIM";
  }

  if (pnl < 0 && exposure >= 10) {
    return "REVIEW";
  }

  if (exposure < 10) {
    return "ADD_SELECTIVELY";
  }

  return "HOLD";
}

function getPriority(exposure, pnl) {
  if (exposure >= 45) {
    return "HIGH";
  }

  if (exposure >= 30 || pnl < 0) {
    return "MEDIUM";
  }

  return "LOW";
}

function groupHoldingsBySymbol(holdings) {
  const map = new Map();

  for (const item of holdings) {
    const symbol = String(item.symbol || "").trim();

    if (!map.has(symbol)) {
      map.set(symbol, {
        symbol,
        sector: item.sector || "Unknown",
        brokers: [],
        quantity: 0,
        marketValue: 0,
        totalCost: 0,
        unrealizedPnL: 0,
        realizedPnL: 0
      });
    }

    const current = map.get(symbol);

    const qty = Number(item.quantity || 0);
    const avg = Number(item.averageCost || 0);

    current.quantity += qty;
    current.marketValue += Number(item.marketValue || 0);
    current.totalCost += qty * avg;
    current.unrealizedPnL += Number(item.unrealizedPnL || 0);
    current.realizedPnL += Number(item.realizedPnL || 0);

    if (!current.brokers.includes(item.broker)) {
      current.brokers.push(item.broker);
    }
  }

  return Array.from(map.values()).map((item) => ({
    ...item,
    averageCost:
      item.quantity > 0
        ? Number((item.totalCost / item.quantity).toFixed(2))
        : 0,
    marketValue: Number(item.marketValue.toFixed(2)),
    unrealizedPnL: Number(item.unrealizedPnL.toFixed(2)),
    realizedPnL: Number(item.realizedPnL.toFixed(2))
  }));
}

export async function getAIRebalanceSuggestions() {
  const portfolio = await getUnifiedPortfolio();

  const totalValue = Number(portfolio.totalMarketValue || 0);
  const groupedHoldings = groupHoldingsBySymbol(
    portfolio.holdings || []
  );

  const suggestions = groupedHoldings.map((item) => {
    const marketValue = Number(item.marketValue || 0);
    const pnl = Number(item.unrealizedPnL || 0);

    const exposure =
      totalValue > 0
        ? Math.round((marketValue / totalValue) * 100)
        : 0;

    const action = getAction(exposure, pnl);
    const priority = getPriority(exposure, pnl);

    return {
      symbol: item.symbol,
      sector: item.sector,
      brokers: item.brokers,
      quantity: item.quantity,
      averageCost: item.averageCost,
      exposure,
      marketValue,
      unrealizedPnL: pnl,
      realizedPnL: item.realizedPnL,
      action,
      priority,
      recommendation:
        action === "REDUCE"
          ? `${item.symbol} is highly concentrated at ${exposure}% across ${item.brokers.join(", ")}. Coach G recommends reducing exposure.`
          : action === "TRIM"
          ? `${item.symbol} is moderately concentrated at ${exposure}%. Consider trimming or waiting for better diversification opportunities.`
          : action === "REVIEW"
          ? `${item.symbol} is under pressure. Review risk before adding more.`
          : action === "ADD_SELECTIVELY"
          ? `${item.symbol} is underweight. Add selectively only if fundamentals and liquidity support it.`
          : `${item.symbol} allocation looks reasonable. Hold and monitor.`
    };
  });

  const highPriorityCount = suggestions.filter(
    (item) => item.priority === "HIGH"
  ).length;

  const riskLevel =
    highPriorityCount > 0
      ? "HIGH"
      : suggestions.some((item) => item.priority === "MEDIUM")
      ? "MEDIUM"
      : "LOW";

  return {
    totalValue,
    riskLevel,
    suggestionCount: suggestions.length,
    suggestions: suggestions.sort((a, b) => {
      const order = {
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1
      };

      return order[b.priority] - order[a.priority];
    }),
    generatedAt: new Date().toISOString()
  };
}