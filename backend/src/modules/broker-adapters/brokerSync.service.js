import { getBrokerAdapter } from "./brokerAdapters.js";
import { settlePortfolio } from "./gatecepDemo.adapter.js";

export async function syncBroker(userId, brokerId = "GATECEP-DEMO") {
  const adapter = getBrokerAdapter(brokerId);
  return await adapter.sync(userId);
}

export async function placeBrokerOrder(userId, brokerId, order = {}) {
  const adapter = getBrokerAdapter(brokerId);

  return await adapter.placeOrder(userId, {
    ...order,
    brokerId
  });
}

export async function settleBroker(userId, brokerId) {
  if (brokerId === "GATECEP-DEMO") {
    return await settlePortfolio(userId);
  }

  throw new Error("Settlement not supported for this broker.");
}