import * as simulationBrokerAdapter from "./simulationBrokerAdapter";
import { findBrokerById } from "./brokerRegistry";

const ADAPTERS = {
  simulation: simulationBrokerAdapter
};

export function getBrokerAdapter(brokerId = "SIM") {
  const broker = findBrokerById(brokerId);
  return ADAPTERS[broker.adapter] || simulationBrokerAdapter;
}

export async function placeBrokerOrder(order = {}) {
  const adapter = getBrokerAdapter(order.brokerId || "SIM");
  return await adapter.placeOrder(order);
}

export async function cancelBrokerOrder(order = {}) {
  const adapter = getBrokerAdapter(order.brokerId || "SIM");
  return await adapter.cancelOrder(order);
}

export async function getBrokerOrderStatus(order = {}) {
  const adapter = getBrokerAdapter(order.brokerId || "SIM");
  return await adapter.getOrderStatus(order);
}

export async function getBrokerPortfolio(brokerId = "SIM") {
  const adapter = getBrokerAdapter(brokerId);
  return await adapter.getPortfolio();
}

export async function getBrokerCashBalance(brokerId = "SIM") {
  const adapter = getBrokerAdapter(brokerId);
  return await adapter.getCashBalance();
}