import { getUnifiedPortfolio } from "./unifiedPortfolio.service.js";

function gradeFromScore(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "A-";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function groupBySymbol(holdings = []) {
  const map = new Map();

  for (const item of holdings) {
    const symbol = String(item.symbol || "").trim();

    if (!map.has(symbol)) {
      map.set(symbol, {
        symbol,
        sector: item.sector || "Unknown",
        marketValue: 0,
        unrealizedPnL: 0
      });
    }

    const current = map.get(symbol);
    current.marketValue += Number(item.marketValue || 0);
    current.unrealizedPnL += Number(item.unrealizedPnL || 0);
  }

  return Array.from(map.values());
}

function groupBySector(holdings = []) {
  const map = new Map();

  for (const item of holdings) {
    const sector = item.sector || "Unknown";

    map.set(
      sector,
      (map.get(sector) || 0) + Number(item.marketValue || 0)
    );
  }

  return Array.from(map.entries()).map(([sector, marketValue]) => ({
    sector,
    marketValue
  }));
}

export async function getPortfolioScore() {
  const portfolio = await getUnifiedPortfolio();

  const holdings = portfolio.holdings || [];
  const totalValue = Number(portfolio.totalMarketValue || 0);
  const totalPnL = Number(portfolio.totalUnrealizedPnL || 0);

  const bySymbol = groupBySymbol(holdings);
  const bySector = groupBySector(holdings);

  const largestHolding = bySymbol.sort(
    (a, b) => b.marketValue - a.marketValue
  )[0];

  const largestSector = bySector.sort(
    (a, b) => b.marketValue - a.marketValue
  )[0];

  const largestHoldingExposure =
    totalValue > 0 && largestHolding
      ? (largestHolding.marketValue / totalValue) * 100
      : 0;

  const largestSectorExposure =
    totalValue > 0 && largestSector
      ? (largestSector.marketValue / totalValue) * 100
      : 0;

  const diversificationScore = clamp(
    bySymbol.length >= 8
      ? 95
      : bySymbol.length >= 5
      ? 80
      : bySymbol.length >= 3
      ? 65
      : 40
  );

  const concentrationScore = clamp(
    100 - largestHoldingExposure
  );

  const sectorBalanceScore = clamp(
    100 - largestSectorExposure
  );

  const profitabilityScore = clamp(
    totalValue > 0
      ? 50 + (totalPnL / totalValue) * 100
      : 50
  );

  const liquidityScore = clamp(
    totalValue >= 500000 ? 85 : totalValue >= 100000 ? 70 : 55
  );

  const incomeScore = clamp(
    holdings.some((item) =>
      ["BAT", "SCOM", "KCB", "EABL", "SCBK"].includes(
        String(item.symbol || "").trim()
      )
    )
      ? 75
      : 50
  );

  const overallScore = clamp(
    diversificationScore * 0.2 +
      concentrationScore * 0.25 +
      sectorBalanceScore * 0.2 +
      profitabilityScore * 0.2 +
      liquidityScore * 0.1 +
      incomeScore * 0.05
  );

  return {
    overallScore,
    grade: gradeFromScore(overallScore),
    riskLevel:
      overallScore >= 80
        ? "LOW"
        : overallScore >= 60
        ? "MEDIUM"
        : "HIGH",
    scores: {
      diversificationScore,
      concentrationScore,
      sectorBalanceScore,
      profitabilityScore,
      liquidityScore,
      incomeScore
    },
    concentration: {
      largestHolding: largestHolding?.symbol || "-",
      largestHoldingExposure: Number(largestHoldingExposure.toFixed(2)),
      largestSector: largestSector?.sector || "-",
      largestSectorExposure: Number(largestSectorExposure.toFixed(2))
    },
    coachGSummary:
      overallScore >= 80
        ? "Portfolio structure is healthy. Continue monitoring concentration and sector exposure."
        : overallScore >= 60
        ? "Portfolio is acceptable but needs better diversification and concentration control."
        : "Portfolio risk is elevated. Coach G recommends reducing concentration and improving sector balance.",
    generatedAt: new Date().toISOString()
  };
}