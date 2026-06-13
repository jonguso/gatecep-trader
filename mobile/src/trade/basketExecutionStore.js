import { userGetItem, userSetItem } from "../auth/userStorage";
import { loadTradeBasket } from "./tradeBasketStore";

export async function createBasketExecution() {
  const basket = await loadTradeBasket();

  if (!basket?.items?.length) {
    return null;
  }

  const execution = {
    id: `EXEC-${Date.now()}`,
    basketId: basket.id,
    source: basket.source || "COACH_G",
    status: "PENDING",
    totalOrders: basket.items.length,
    completedOrders: 0,
    failedOrders: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orders: basket.items.map((item, index) => ({
      id: `EO-${Date.now()}-${index}`,
      basketItemId: item.id,
      symbol: item.symbol,
      name: item.name || item.symbol,
      side: item.side || "BUY",
      amount: Number(item.amount || 0),
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
      reason: item.reason || "Coach G recommendation",
      status: "PENDING",
      message: "Waiting for execution",
      updatedAt: new Date().toISOString()
    }))
  };

  await userSetItem("activeBasketExecution", JSON.stringify(execution));

  return execution;
}

export async function loadBasketExecution() {
  const raw = await userGetItem("activeBasketExecution");
  return raw ? JSON.parse(raw) : null;
}

export async function saveBasketExecution(execution) {
  const next = {
    ...execution,
    updatedAt: new Date().toISOString()
  };

  await userSetItem("activeBasketExecution", JSON.stringify(next));

  return next;
}

export async function clearBasketExecution() {
  await userSetItem("activeBasketExecution", "");
}

export async function updateExecutionOrder(orderId, patch = {}) {
  const execution = await loadBasketExecution();

  if (!execution) return null;

  const orders = execution.orders.map((order) =>
    order.id === orderId
      ? {
          ...order,
          ...patch,
          updatedAt: new Date().toISOString()
        }
      : order
  );

  const completedOrders = orders.filter((o) => o.status === "FILLED").length;
  const failedOrders = orders.filter((o) => o.status === "FAILED").length;

  const status =
    completedOrders === orders.length
      ? "COMPLETE"
      : failedOrders > 0
      ? "PARTIAL"
      : orders.some((o) => o.status !== "PENDING")
      ? "IN_PROGRESS"
      : "PENDING";

  return await saveBasketExecution({
    ...execution,
    orders,
    completedOrders,
    failedOrders,
    status
  });
}