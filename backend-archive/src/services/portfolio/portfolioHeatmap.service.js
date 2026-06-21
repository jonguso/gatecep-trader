import { getUnifiedPortfolio } from "./unifiedPortfolio.service.js";

export async function getPortfolioHeatmap() {
  const portfolio = await getUnifiedPortfolio();

  const heatmap = portfolio.holdings.map((holding) => {
    let riskLevel = "LOW";

    if (Math.abs(holding.unrealizedPnLPercent) >= 20) {
      riskLevel = "HIGH";
    } else if (Math.abs(holding.unrealizedPnLPercent) >= 10) {
      riskLevel = "MEDIUM";
    }

    return {
      broker: holding.broker,
      symbol: holding.symbol,
      quantity: holding.quantity,
      marketValue: holding.marketValue,
      unrealizedPnL: holding.unrealizedPnL,
      unrealizedPnLPercent: holding.unrealizedPnLPercent,
      weight:
        portfolio.totalMarketValue > 0
          ? Number(
              (
                (holding.marketValue / portfolio.totalMarketValue) *
                100
              ).toFixed(2)
            )
          : 0,
      riskLevel
    };
  });

  return {
    totalMarketValue: portfolio.totalMarketValue,
    totalPnL: portfolio.totalPnL,
    heatmap,
    generatedAt: new Date().toISOString()
  };
}