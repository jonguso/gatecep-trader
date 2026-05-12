import { getUnifiedPortfolio } from "./unifiedPortfolio.service.js";

const sectorMap = {
  KCB: "Banking",
  EQTY: "Banking",
  SCOM: "Telecom",
  COOP: "Banking",
  BAT: "Manufacturing",
  EABL: "Manufacturing"
};

export async function getSectorAllocation() {
  const portfolio = await getUnifiedPortfolio();

  const sectors = new Map();

  for (const holding of portfolio.holdings) {
    const sector =
      sectorMap[holding.symbol] || "Other";

    const current =
      sectors.get(sector) || {
        sector,
        marketValue: 0
      };

    current.marketValue += holding.marketValue;

    sectors.set(sector, current);
  }

  const total = portfolio.totalMarketValue || 1;

  const allocation = Array.from(sectors.values()).map((item) => ({
    ...item,
    weight: Number(
      ((item.marketValue / total) * 100).toFixed(2)
    )
  }));

  return {
    totalMarketValue: portfolio.totalMarketValue,
    sectors: allocation,
    generatedAt: new Date().toISOString()
  };
}