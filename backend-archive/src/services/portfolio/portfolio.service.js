import { getExecutionQueue } from "../orders/executionQueue.service.js";

export async function getPortfolio() {
  const orders = await getExecutionQueue();

  const cashBalance = 1000000;
  const holdings = {};

  for (const order of orders) {
    if (order.status !== "FILLED") continue;

    const symbol = order.symbol;
    const qty = Number(order.filledQuantity || 0);
    const price = Number(order.averageFillPrice || order.price || 0);

    if (!holdings[symbol]) {
      holdings[symbol] = {
        symbol,
        quantity: 0,
        averageCost: 0,
        costBasis: 0,
        marketPrice: price,
        marketValue: 0,
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0
      };
    }

    const current = holdings[symbol];
    const oldCost = current.costBasis;
    const newCost = qty * price;

    current.quantity += qty;
    current.costBasis += newCost;
    current.averageCost =
      current.quantity > 0
        ? Number((current.costBasis / current.quantity).toFixed(2))
        : 0;

    current.marketPrice = Number((price * 1.03).toFixed(2));
    current.marketValue = Number((current.quantity * current.marketPrice).toFixed(2));
    current.unrealizedPnL = Number((current.marketValue - current.costBasis).toFixed(2));
    current.unrealizedPnLPercent =
      current.costBasis > 0
        ? Number(((current.unrealizedPnL / current.costBasis) * 100).toFixed(2))
        : 0;
  }

  const positions = Object.values(holdings);

  const totalMarketValue = positions.reduce(
    (sum, p) => sum + p.marketValue,
    0
  );

  const totalCostBasis = positions.reduce(
    (sum, p) => sum + p.costBasis,
    0
  );

  const totalUnrealizedPnL = Number(
    (totalMarketValue - totalCostBasis).toFixed(2)
  );

  const availableBuyingPower = Number((cashBalance - totalCostBasis).toFixed(2));

  return {
    cashBalance,
    availableBuyingPower,
    totalCostBasis: Number(totalCostBasis.toFixed(2)),
    totalMarketValue: Number(totalMarketValue.toFixed(2)),
    totalUnrealizedPnL,
    totalUnrealizedPnLPercent:
      totalCostBasis > 0
        ? Number(((totalUnrealizedPnL / totalCostBasis) * 100).toFixed(2))
        : 0,
    positions
  };
}