export async function placeOrder(order = {}) {
  const now = new Date().toISOString();

  return {
    ok: true,
    brokerId: order.brokerId || "SIM",
    brokerName: order.brokerName || "Simulation Broker",
    brokerOrderId: `SIM-ORD-${Date.now()}-${order.symbol}`,
    status: "BROKER_RECEIVED",
    submittedAt: now,
    receivedAt: now,
    message: "Simulation broker received order.",
    order: {
      ...order,
      brokerStatus: "BROKER_RECEIVED"
    }
  };
}

export async function cancelOrder(order = {}) {
  return {
    ok: true,
    brokerOrderId: order.brokerOrderId,
    status: "CANCELLED",
    cancelledAt: new Date().toISOString(),
    message: "Simulation broker cancelled order."
  };
}

export async function getOrderStatus(order = {}) {
  return {
    ok: true,
    brokerOrderId: order.brokerOrderId,
    status: order.status || "BROKER_RECEIVED",
    filledQuantity: order.filledQuantity || 0,
    remainingQuantity: order.remainingQuantity || order.quantity || 0,
    checkedAt: new Date().toISOString()
  };
}

export async function getPortfolio() {
  return {
    ok: true,
    holdings: [],
    syncedAt: new Date().toISOString()
  };
}

export async function getCashBalance() {
  return {
    ok: true,
    cash: 0,
    currency: "KES",
    syncedAt: new Date().toISOString()
  };
}