import { createPendingApiResponse } from "./pendingBrokerAdapter";

export async function placeOrder(order = {}) {
  return createPendingApiResponse("GENGHIS", "Genghis Capital", order);
}

export async function cancelOrder(order = {}) {
  return createPendingApiResponse("GENGHIS", "Genghis Capital", order, "CANCEL_PENDING_API");
}

export async function getOrderStatus(order = {}) {
  return createPendingApiResponse("GENGHIS", "Genghis Capital", order, "STATUS_PENDING_API");
}

export async function getPortfolio() {
  return {
    ok: false,
    brokerId: "GENGHIS",
    brokerName: "Genghis Capital",
    status: "PENDING_API",
    holdings: [],
    message: "GENGHIS API connector is not enabled yet."
  };
}

export async function getCashBalance() {
  return {
    ok: false,
    brokerId: "GENGHIS",
    brokerName: "Genghis Capital",
    status: "PENDING_API",
    cash: 0,
    currency: "KES",
    message: "GENGHIS cash sync is not enabled yet."
  };
}