import {
  getExecutionQueue
} from "../orders/executionQueue.service.js";

export async function getPortfolioRisk() {
  const orders = await getExecutionQueue();

  const positions = {};
  let totalExposure = 0;

  for (const order of orders) {
    if (
      !["FILLED", "PARTIAL_FILL"].includes(order.status)
    ) {
      continue;
    }

    const symbol = order.symbol;
    const filledQty = Number(order.filledQuantity || 0);
    const avgPrice = Number(order.averageFillPrice || 0);

    const exposure = filledQty * avgPrice;

    totalExposure += exposure;

    if (!positions[symbol]) {
      positions[symbol] = {
        symbol,
        quantity: 0,
        averagePrice: 0,
        marketValue: 0,
        exposurePercent: 0,
        realizedPnL: 0,
        unrealizedPnL: 0,
        riskScore: 0
      };
    }

    positions[symbol].quantity += filledQty;
    positions[symbol].marketValue += exposure;
    positions[symbol].averagePrice = avgPrice;
  }

  for (const symbol of Object.keys(positions)) {
    const position = positions[symbol];

    position.exposurePercent =
      totalExposure > 0
        ? Number(
            (
              (position.marketValue / totalExposure) *
              100
            ).toFixed(2)
          )
        : 0;

    const simulatedMove =
      (Math.random() * 10 - 5) / 100;

    position.unrealizedPnL = Number(
      (position.marketValue * simulatedMove).toFixed(2)
    );

    position.realizedPnL = Number(
      (position.marketValue * 0.02).toFixed(2)
    );

    position.riskScore = Math.min(
      100,
      Math.round(position.exposurePercent * 1.5)
    );
  }

  const concentrationRisk =
    Object.values(positions).some(
      (p) => p.exposurePercent > 40
    );

  return {
    totalExposure: Number(totalExposure.toFixed(2)),
    concentrationRisk,
    positions: Object.values(positions)
  };
}