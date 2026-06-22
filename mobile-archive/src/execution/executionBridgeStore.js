import { userGetItem, userSetItem } from "../auth/userStorage";
import { loadBasketExecution } from "../trade/basketExecutionStore";

const EXECUTION_BRIDGE_KEY = "executionBridge";

export async function buildExecutionBridge() {
  const execution = await loadBasketExecution();

  const orders = execution?.orders || [];

  const bridge = {
    id: execution?.id || `BRIDGE-${Date.now()}`,
    source: execution?.source || "COACH_G",
    createdAt: execution?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    pendingReview: orders.filter(
      (o) =>
        o.status === "PENDING" ||
        o.status === "PENDING_REVIEW"
    ),

    readyToQueue: orders.filter(
      (o) => o.status === "READY_TO_QUEUE"
    ),

    queued: orders.filter(
      (o) =>
        o.status === "QUEUED" ||
        o.status === "ROUTED" ||
        o.status === "BROKER_RECEIVED"
    ),

    completed: orders.filter(
      (o) => o.status === "FILLED"
    ),

    failed: orders.filter(
      (o) =>
        o.status === "FAILED" ||
        o.status === "REJECTED" ||
        o.status === "CANCELLED"
    )
  };

  await userSetItem(
    EXECUTION_BRIDGE_KEY,
    JSON.stringify(bridge)
  );

  return bridge;
}

export async function loadExecutionBridge() {
  const raw = await userGetItem(EXECUTION_BRIDGE_KEY);

  if (!raw) {
    return await buildExecutionBridge();
  }

  try {
    return JSON.parse(raw);
  } catch {
    return await buildExecutionBridge();
  }
}

export async function refreshExecutionBridge() {
  return await buildExecutionBridge();
}