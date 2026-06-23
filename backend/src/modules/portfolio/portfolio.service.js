import {
  addUserHolding,
  listUserPortfolio
} from "./portfolio.repository.js";

export async function getUserPortfolio(userId) {
  const holdings = await listUserPortfolio(userId);

  const totalValue = holdings.reduce(
    (sum, item) => sum + Number(item.marketValue || 0),
    0
  );

  const totalProfitLoss = holdings.reduce(
    (sum, item) => sum + Number(item.profitLoss || 0),
    0
  );

  return {
    holdings,
    summary: {
      totalHoldings: holdings.length,
      totalValue,
      totalProfitLoss
    }
  };
}

export async function createHolding(userId, payload) {
  return await addUserHolding(userId, payload);
}