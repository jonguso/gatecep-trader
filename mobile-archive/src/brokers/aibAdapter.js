import { createPendingApiResponse } from "./pendingBrokerAdapter";

export async function placeOrder(order = {}) {
  return createPendingApiResponse("AIB", "AIB-AXYS", order);
}

export async function cancelOrder(order = {}) {
  return createPendingApiResponse("AIB", "AIB-AXYS", order, "CANCEL_PENDING_API");
}

export async function getOrderStatus(order = {}) {
  return createPendingApiResponse("AIB", "AIB-AXYS", order, "STATUS_PENDING_API");
}

export async function getPortfolio() {
  return {
    ok: false,
    brokerId: "AIB",
    brokerName: "AIB-AXYS",
    status: "PENDING_API",
    holdings: [],
    message: "AIB API connector is not enabled yet."
  };
}

export async function getCashBalance() {
  return {
    ok: false,
    brokerId: "AIB",
    brokerName: "AIB-AXYS",
    status: "PENDING_API",
    cash: 0,
    currency: "KES",
    message: "AIB cash sync is not enabled yet."
  };
}