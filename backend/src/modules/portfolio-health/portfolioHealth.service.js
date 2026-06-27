import { getMarketIntelligenceHome } from "../market-intelligence/marketIntelligence.service.js";

function n(value) {
  return Number(value || 0);
}

function round(value) {
  return Number(n(value).toFixed(2));
}

export async function getPortfolioHealth(userId) {
  const intelligence = await getMarketIntelligenceHome(userId);
  const holdings = intelligence?.holdings || [];
  const summary = intelligence?.summary || {};

  const totalValue = n(summary.totalValue);
  const totalCash = n(summary.totalCash);
  const netWorth = n(summary.netWorth || totalValue + totalCash);

  const sectorMap = {};

  for (const holding of holdings) {
    const sector = holding.sector || "Unknown";
    sectorMap[sector] = (sectorMap[sector] || 0) + n(holding.marketValue);
  }

  const sectorExposure = Object.entries(sectorMap)
    .map(([sector, value]) => ({
      sector,
      value: round(value),
      weight: totalValue > 0 ? round((value / totalValue) * 100) : 0
    }))
    .sort((a, b) => b.weight - a.weight);

  const largestSector = sectorExposure[0];

  const cashAllocation =
    netWorth > 0 ? round((totalCash / netWorth) * 100) : 0;

  const concentrationPenalty =
    largestSector?.weight > 40 ? (largestSector.weight - 40) * 0.7 : 0;

  const lowCashPenalty = cashAllocation < 5 ? 8 : 0;
  const highCashPenalty = cashAllocation > 35 ? 6 : 0;

  const diversificationScore = Math.max(
    0,
    100 - concentrationPenalty - Math.max(0, 5 - sectorExposure.length) * 8
  );

  const cashScore = Math.max(0, 100 - lowCashPenalty - highCashPenalty);

  const gainScore =
    n(summary.totalGainPct) >= 0
      ? Math.min(100, 75 + n(summary.totalGainPct))
      : Math.max(40, 75 + n(summary.totalGainPct));

  const score = Math.round(
    diversificationScore * 0.45 + cashScore * 0.25 + gainScore * 0.3
  );

  const risk =
    largestSector?.weight > 45
      ? "Concentrated"
      : cashAllocation > 30
      ? "Conservative"
      : "Balanced";

  const recommendations = [];

  if (largestSector?.weight > 40) {
    recommendations.push({
      type: "SECTOR_CONCENTRATION",
      title: `${largestSector.sector} exposure is high`,
      message: `Your ${largestSector.sector} allocation is ${largestSector.weight}%. Consider adding ETFs or other sectors to improve diversification.`,
      confidence: 86
    });
  }

  if (cashAllocation < 5) {
    recommendations.push({
      type: "LOW_CASH",
      title: "Cash reserve is low",
      message: "You have limited available cash. Consider keeping a small cash buffer for opportunities and emergencies.",
      confidence: 82
    });
  }

  if (cashAllocation > 30) {
    recommendations.push({
      type: "HIGH_CASH",
      title: "Cash allocation is high",
      message: "You may have excess idle cash. Consider gradually deploying into diversified holdings.",
      confidence: 78
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      type: "HEALTHY_PORTFOLIO",
      title: "Portfolio looks balanced",
      message: "Your portfolio has reasonable diversification and cash allocation. Continue monitoring market movement.",
      confidence: 84
    });
  }

  return {
    ok: true,
    score,
    risk,
    diversification: Math.round(diversificationScore),
    cashAllocation,
    totalValue: round(totalValue),
    netWorth: round(netWorth),
    sectorExposure,
    largestSector,
    recommendations,
    generatedAt: new Date().toISOString(),
    version: "PortfolioHealth-022A"
  };
}