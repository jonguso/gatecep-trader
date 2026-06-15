import { loadBasketExecution } from "../trade/basketExecutionStore";
import { loadBrokerAccounts } from "../brokers/brokerAccountStore";

export async function generateOrderPack() {
  const execution = await loadBasketExecution();
  const brokers = await loadBrokerAccounts();

  const broker =
    brokers.find((b) => b.defaultBroker) ||
    brokers[0] ||
    null;

  const activeOrders =
    execution?.orders?.filter(
      (o) =>
        !["FILLED", "CANCELLED", "FAILED"].includes(
          String(o.status).toUpperCase()
        )
    ) || [];

  const totalValue = activeOrders.reduce(
    (sum, order) =>
      sum +
      Number(order.quantity || 0) *
        Number(order.price || 0),
    0
  );

  return {
    broker,
    orders: activeOrders,
    totalOrders: activeOrders.length,
    totalValue
  };
}

export function buildCsv(pack) {
  const lines = [
    "symbol,side,quantity,price"
  ];

  pack.orders.forEach((order) => {
    lines.push(
      [
        order.symbol,
        order.side,
        order.quantity,
        order.price
      ].join(",")
    );
  });

  return lines.join("\n");
}

export function buildText(pack) {
  const rows = [];

  rows.push(
    `Broker: ${pack.broker?.brokerName || "Not Selected"}`
  );

  rows.push("");

  pack.orders.forEach((order) => {
    rows.push(
      `${order.side} ${order.symbol} Qty ${order.quantity} @ ${order.price}`
    );
  });

  rows.push("");
  rows.push(
    `Estimated Value: KES ${pack.totalValue.toLocaleString()}`
  );

  return rows.join("\n");
}