import { marketDataGateway } from "../marketData/MarketDataGateway.js";

function classifySector(score) {
  if (score >= 70) {
    return "LEADING";
  }

  if (score >= 55) {
    return "IMPROVING";
  }

  if (score >= 40) {
    return "WEAKENING";
  }

  return "LAGGING";
}

export async function getSectorRotationAI() {
  const prices = await marketDataGateway.getPrices();
  const rows = prices.data || [];

  const sectorMap = new Map();

  for (const item of rows) {
    const sector = item.sector || "Unknown";

    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, {
        sector,
        count: 0,
        gainers: 0,
        losers: 0,
        totalChangePct: 0,
        totalTurnover: 0
      });
    }

    const current = sectorMap.get(sector);
    const changePct = Number(item.changePct || 0);

    current.count += 1;
    current.totalChangePct += changePct;
    current.totalTurnover += Number(item.turnover || 0);

    if (changePct > 0) {
      current.gainers += 1;
    }

    if (changePct < 0) {
      current.losers += 1;
    }
  }

  const sectors = Array.from(sectorMap.values()).map((item) => {
    const avgChange =
      item.count > 0
        ? item.totalChangePct / item.count
        : 0;

    const breadthScore =
      item.count > 0
        ? (item.gainers / item.count) * 50
        : 0;

    const momentumScore =
      Math.max(
        0,
        Math.min(30, avgChange * 10 + 15)
      );

    const liquidityScore =
      item.totalTurnover >= 1000000000
        ? 20
        : item.totalTurnover >= 500000000
        ? 15
        : item.totalTurnover >= 100000000
        ? 10
        : 5;

    const score = Math.round(
      breadthScore +
        momentumScore +
        liquidityScore
    );

    return {
      sector: item.sector,
      count: item.count,
      gainers: item.gainers,
      losers: item.losers,
      averageChangePct: Number(avgChange.toFixed(2)),
      totalTurnover: Number(item.totalTurnover.toFixed(2)),
      rotationScore: score,
      phase: classifySector(score),
      coachGInsight:
        score >= 70
          ? `${item.sector} is leading market rotation with strong breadth and liquidity.`
          : score >= 55
          ? `${item.sector} is improving. Watch for confirmation from turnover and price strength.`
          : score >= 40
          ? `${item.sector} is weakening. Be selective and avoid weak names.`
          : `${item.sector} is lagging. Coach G recommends caution.`
    };
  });

  return {
    sectors: sectors.sort(
      (a, b) => b.rotationScore - a.rotationScore
    ),
    leader: sectors.sort(
      (a, b) => b.rotationScore - a.rotationScore
    )[0],
    laggard: sectors.sort(
      (a, b) => a.rotationScore - b.rotationScore
    )[0],
    generatedAt: new Date().toISOString()
  };
}