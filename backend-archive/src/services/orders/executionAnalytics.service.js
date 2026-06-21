import { getExecutionQueue } from "./executionQueue.service.js";

export async function getExecutionAnalytics() {
  const orders = await getExecutionQueue();

  const totalOrders = orders.length;

  const filledOrders = orders.filter(
    (o) => o.status === "FILLED"
  ).length;

  const rejectedOrders = orders.filter(
    (o) => o.status === "REJECTED"
  ).length;

  const cancelledOrders = orders.filter(
    (o) => o.status === "CANCELLED"
  ).length;

  const partialFillOrders = orders.filter(
    (o) => o.status === "PARTIAL_FILL"
  ).length;

  const fillRate =
    totalOrders > 0
      ? Number(((filledOrders / totalOrders) * 100).toFixed(2))
      : 0;

  const rejectionRate =
    totalOrders > 0
      ? Number(((rejectedOrders / totalOrders) * 100).toFixed(2))
      : 0;

  const averageFillPercent =
    totalOrders > 0
      ? Number(
          (
            orders.reduce(
              (sum, order) => sum + (order.fillPercent || 0),
              0
            ) / totalOrders
          ).toFixed(2)
        )
      : 0;

  const brokerStats = {};

  for (const order of orders) {
    const broker = order.broker || "UNKNOWN";

    if (!brokerStats[broker]) {
      brokerStats[broker] = {
        totalOrders: 0,
        filledOrders: 0,
        rejectedOrders: 0,
        cancelledOrders: 0
      };
    }

    brokerStats[broker].totalOrders += 1;

    if (order.status === "FILLED") {
      brokerStats[broker].filledOrders += 1;
    }

    if (order.status === "REJECTED") {
      brokerStats[broker].rejectedOrders += 1;
    }

    if (order.status === "CANCELLED") {
      brokerStats[broker].cancelledOrders += 1;
    }
  }

  return {
    totalOrders,
    filledOrders,
    rejectedOrders,
    cancelledOrders,
    partialFillOrders,
    fillRate,
    rejectionRate,
    averageFillPercent,
    brokerStats
  };
}