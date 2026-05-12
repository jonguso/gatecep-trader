import { getUnifiedPortfolio } from "./unifiedPortfolio.service.js";

export async function getPortfolioRiskAnalysis() {
  const portfolio = await getUnifiedPortfolio();

  const concentrationRisk =
    portfolio.holdingCount <= 2
      ? "HIGH"
      : portfolio.holdingCount <= 5
      ? "MEDIUM"
      : "LOW";

  const brokerRisk =
    portfolio.brokerCount === 1
      ? "HIGH"
      : "LOW";

  const largestHolding =
    [...portfolio.holdings].sort(
      (a, b) => b.marketValue - a.marketValue
    )[0];

  const diversificationScore = Math.max(
    10,
    100 -
      (portfolio.holdingCount < 5 ? 40 : 0) -
      (portfolio.brokerCount < 2 ? 30 : 0)
  );

  return {
    totalMarketValue: portfolio.totalMarketValue,

    diversificationScore,

    concentrationRisk,

    brokerRisk,

    largestHolding: largestHolding
      ? {
          symbol: largestHolding.symbol,
          marketValue: largestHolding.marketValue,
          weight:
            portfolio.totalMarketValue > 0
              ? Number(
                  (
                    (largestHolding.marketValue /
                      portfolio.totalMarketValue) *
                    100
                  ).toFixed(2)
                )
              : 0
        }
      : null,

    recommendations: [
      concentrationRisk === "HIGH"
        ? "Reduce concentration by adding more NSE stocks."
        : "Portfolio concentration acceptable.",

      brokerRisk === "HIGH"
        ? "Add another broker for operational diversification."
        : "Broker diversification acceptable."
    ],

    generatedAt: new Date().toISOString()
  };
}