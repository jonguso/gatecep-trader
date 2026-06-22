import { createPendingApiResponse } from "./pendingBrokerAdapter";

export async function placeOrder(order = {}) {
  return createPendingApiResponse("ABC", "ABC Capital", order);
}

export async function cancelOrder(order = {}) {
  return createPendingApiResponse("ABC", "ABC Capital", order, "CANCEL_PENDING_API");
}

export async function getOrderStatus(order = {}) {
  return createPendingApiResponse("ABC", "ABC Capital", order, "STATUS_PENDING_API");
}

export async function getPortfolio() {
  return {
    ok: false,
    brokerId: "ABC",
    brokerName: "ABC Capital",
    status: "PENDING_API",
    holdings: [],
    message: "ABC API connector is not enabled yet."
  };
}

export async function getCashBalance() {
  return {
    ok: false,
    brokerId: "ABC",
    brokerName: "ABC Capital",
    status: "PENDING_API",
    cash: 0,
    currency: "KES",
    message: "ABC cash sync is not enabled yet."
  };
}