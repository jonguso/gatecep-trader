import { createPendingApiResponse } from "./pendingBrokerAdapter";

export async function placeOrder(order = {}) {
  return createPendingApiResponse("FAIDA", "Faida Investment Bank", order);
}

export async function cancelOrder(order = {}) {
  return createPendingApiResponse("FAIDA", "Faida Investment Bank", order, "CANCEL_PENDING_API");
}

export async function getOrderStatus(order = {}) {
  return createPendingApiResponse("FAIDA", "Faida Investment Bank", order, "STATUS_PENDING_API");
}

export async function getPortfolio() {
  return {
    ok: false,
    brokerId: "FAIDA",
    brokerName: "Faida Investment Bank",
    status: "PENDING_API",
    holdings: [],
    message: "FAIDA API connector is not enabled yet."
  };
}

export async function getCashBalance() {
  return {
    ok: false,
    brokerId: "FAIDA",
    brokerName: "Faida Investment Bank",
    status: "PENDING_API",
    cash: 0,
    currency: "KES",
    message: "FAIDA cash sync is not enabled yet."
  };
}