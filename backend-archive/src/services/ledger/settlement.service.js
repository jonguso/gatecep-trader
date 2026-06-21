import { getExecutionQueue } from "../orders/executionQueue.service.js";

export async function getSettlementLedger() {
  const orders = await getExecutionQueue();

  const ledger = [];
  let settledCash = 1000000;
  let unsettledCash = 0;

  for (const order of orders) {
    if (order.status !== "FILLED") continue;

    const tradeValue =
      Number(order.filledQuantity || 0) *
      Number(order.averageFillPrice || order.price || 0);

    const settlementDate = new Date(
      new Date(order.updatedAt).getTime() +
        3 * 24 * 60 * 60 * 1000
    );

    const settled =
      settlementDate <= new Date();

    if (order.side === "BUY") {
      if (settled) {
        settledCash -= tradeValue;
      } else {
        unsettledCash += tradeValue;
      }
    }

    if (order.side === "SELL") {
      if (settled) {
        settledCash += tradeValue;
      } else {
        unsettledCash += tradeValue;
      }
    }

    ledger.push({
      orderId: order.id,
      symbol: order.symbol,
      side: order.side,
      quantity: order.filledQuantity,
      price: order.averageFillPrice,
      tradeValue: Number(tradeValue.toFixed(2)),
      tradeDate: order.updatedAt,
      settlementDate:
        settlementDate.toISOString(),
      settlementStatus: settled
        ? "SETTLED"
        : "UNSETTLED"
    });
  }

  return {
    settledCash: Number(settledCash.toFixed(2)),
    unsettledCash: Number(unsettledCash.toFixed(2)),
    availableCash: Number(
      (settledCash - unsettledCash).toFixed(2)
    ),
    ledger
  };
}