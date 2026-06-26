import { listUserPortfolio } from "../../../modules/portfolio/portfolio.repository.js";

export async function getPortfolioSummary(userId) {
  const holdings = await listUserPortfolio(userId);

  const totalValue = holdings.reduce(
    (sum, h) => sum + Number(h.marketValue || 0),
    0
  );

  const investedValue = holdings.reduce(
    (sum, h) =>
      sum + Number(h.quantity || 0) * Number(h.averagePrice || 0),
    0
  );

  const totalGain = totalValue - investedValue;

  const gainPct =
    investedValue > 0 ? (totalGain / investedValue) * 100 : 0;

  return {
    holdings,
    totalValue,
    investedValue,
    totalGain,
    gainPct: Number(gainPct.toFixed(2)),
    holdingsCount: holdings.length
  };
}