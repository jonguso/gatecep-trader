import { getExecutionQueue } from "../orders/executionQueue.service.js";

export function updatePositionFromFill(order) {
  // Compatibility hook used by executionQueue.service.js.
  // Positions are rebuilt dynamically from FILLED orders in getPositions().
  return order;
}

export async function getPositions() {
  const orders = await getExecutionQueue();
  const positionsMap = new Map();

  for (const order of orders) {
    if (order.status !== "FILLED") {
      continue;
    }

    const broker = order.broker || "AIB";
    const symbol = order.symbol;
    const side = order.side;

    const quantity = Number(
      order.filledQuantity ||
        order.quantity ||
        0
    );

    const price = Number(
      order.averageFillPrice ||
        order.price ||
        0
    );

    if (!symbol || quantity <= 0 || price <= 0) {
      continue;
    }

    const key = `${broker}-${symbol}`;

    if (!positionsMap.has(key)) {
      positionsMap.set(key, {
        broker,
        symbol,
        quantity: 0,
        averageCost: 0,
        totalCost: 0,
        realizedPnL: 0,
        updatedAt: new Date().toISOString()
      });
    }

    const current = positionsMap.get(key);

    if (side === "BUY") {
      const oldQty = Number(current.quantity || 0);
      const oldAvg = Number(current.averageCost || 0);
      const newQty = oldQty + quantity;

      const weightedAverage =
        newQty > 0
          ? (oldQty * oldAvg + quantity * price) / newQty
          : 0;

      current.quantity = newQty;
      current.averageCost = Number(weightedAverage.toFixed(2));
      current.totalCost = Number(
        (current.quantity * current.averageCost).toFixed(2)
      );
    }

    if (side === "SELL") {
      const sellQty = Math.min(quantity, current.quantity);

      current.quantity = Math.max(
        0,
        current.quantity - sellQty
      );

      current.realizedPnL +=
        (price - current.averageCost) * sellQty;

      current.totalCost = Number(
        (current.quantity * current.averageCost).toFixed(2)
      );
    }

    current.updatedAt =
      order.updatedAt ||
      order.createdAt ||
      new Date().toISOString();
  }

  return Array.from(positionsMap.values())
    .filter((item) => Number(item.quantity || 0) > 0)
    .map((item) => ({
      broker: item.broker,
      symbol: item.symbol,
      quantity: Number(item.quantity || 0),
      averageCost: Number(Number(item.averageCost || 0).toFixed(2)),
      realizedPnL: Number(Number(item.realizedPnL || 0).toFixed(2)),
      updatedAt: item.updatedAt
    }));
}

export async function getPositionBySymbol(symbol) {
  const positions = await getPositions();

  return (
    positions.find(
      (item) =>
        String(item.symbol).toUpperCase() ===
        String(symbol).toUpperCase()
    ) || null
  );
}

export async function initializePositions() {
  console.log("Positions service initialized");
  return true;
}