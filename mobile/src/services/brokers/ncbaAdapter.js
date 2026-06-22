import { createPendingApiResponse } from "./pendingBrokerAdapter";

export async function placeOrder(order = {}) {
  return createPendingApiResponse("NCBA", "NCBA Investment Bank", order);
}

export async function cancelOrder(order = {}) {
  return createPendingApiResponse("NCBA", "NCBA Investment Bank", order, "CANCEL_PENDING_API");
}

export async function getOrderStatus(order = {}) {
  return createPendingApiResponse("NCBA", "NCBA Investment Bank", order, "STATUS_PENDING_API");
}

export async function getPortfolio() {
  return {
    ok: false,
    brokerId: "NCBA",
    brokerName: "NCBA Investment Bank",
    status: "PENDING_API",
    holdings: [],
    message: "NCBA API connector is not enabled yet."
  };
}

export async function getCashBalance() {
  return {
    ok: false,
    brokerId: "NCBA",
    brokerName: "NCBA Investment Bank",
    status: "PENDING_API",
    cash: 0,
    currency: "KES",
    message: "NCBA cash sync is not enabled yet."
  };
}