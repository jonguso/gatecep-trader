import { userGetItem, userSetItem } from "../auth/userStorage";
import { loadTradeBasket } from "./tradeBasketStore";

const ACTIVE_BASKET_EXECUTION_KEY = "activeBasketExecution";

export async function createBasketExecution() {
  const basket = await loadTradeBasket();

  if (!basket?.items?.length) {
    return null;
  }

  const now = new Date().toISOString();

  const orders = basket.items.map((item, index) => {
    const price = Number(item.price || item.limitPrice || 0);
    const amount = Number(item.amount || 0);

    const quantity =
      Number(item.quantity || 0) > 0
        ? Number(item.quantity)
        : price > 0 && amount > 0
        ? Math.floor(amount / price)
        : 0;

    const gross = quantity * price;

    return {
      id: `EO-${Date.now()}-${index}`,
      basketItemId: item.id || `BI-${index}`,
      symbol: String(item.symbol || "").toUpperCase(),
      name: item.name || item.symbol,
      sector: item.sector || "NSE",
      side: item.side || "BUY",
      amount: amount || gross,
      quantity,
      price,
      gross,
      reason: item.reason || "Coach G recommendation",
      status: "PENDING",
      message: "Waiting for execution",
      createdAt: now,
      updatedAt: now
    };
  });

  const execution = {
    id: `EXEC-${Date.now()}`,
    basketId: basket.id,
    source: basket.source || "COACH_G",
    status: "PENDING",
    totalOrders: orders.length,
    completedOrders: 0,
    failedOrders: 0,
    totalAmount: orders.reduce(
      (sum, order) => sum + Number(order.amount || order.gross || 0),
      0
    ),
    createdAt: now,
    updatedAt: now,
    orders
  };

  await userSetItem(ACTIVE_BASKET_EXECUTION_KEY, JSON.stringify(execution));

  return execution;
}

export async function loadBasketExecution() {
  const raw = await userGetItem(ACTIVE_BASKET_EXECUTION_KEY);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed?.orders?.length ? normalizeExecution(parsed) : null;
  } catch {
    return null;
  }
}

export async function saveBasketExecution(execution) {
  if (!execution) return null;

  const next = normalizeExecution({
    ...execution,
    updatedAt: new Date().toISOString()
  });

  await userSetItem(ACTIVE_BASKET_EXECUTION_KEY, JSON.stringify(next));

  return next;
}

export async function clearBasketExecution() {
  await userSetItem(ACTIVE_BASKET_EXECUTION_KEY, "");
}

export async function updateExecutionOrder(orderId, patch = {}) {
  const execution = await loadBasketExecution();

  if (!execution) return null;

  const orders = execution.orders.map((order) =>
    order.id === orderId
      ? normalizeOrder({
          ...order,
          ...patch,
          updatedAt: new Date().toISOString()
        })
      : normalizeOrder(order)
  );

  return await saveBasketExecution({
    ...execution,
    orders
  });
}

export function normalizeExecution(execution = {}) {
  const orders = Array.isArray(execution.orders)
    ? execution.orders.map(normalizeOrder)
    : [];

  const completedOrders = orders.filter((order) => order.status === "FILLED").length;
  const failedOrders = orders.filter((order) => order.status === "FAILED").length;
  const totalOrders = orders.length;

  const status =
    totalOrders > 0 && completedOrders === totalOrders
      ? "COMPLETED"
      : failedOrders > 0 && completedOrders > 0
      ? "PARTIAL"
      : orders.some((order) =>
          ["QUEUED", "SUBMITTED", "IN_PROGRESS", "FILLED"].includes(order.status)
        )
      ? "IN_PROGRESS"
      : execution.status || "PENDING";

  return {
    ...execution,
    status,
    totalOrders,
    completedOrders,
    failedOrders,
    totalAmount: orders.reduce(
      (sum, order) => sum + Number(order.amount || order.gross || 0),
      0
    ),
    orders,
    updatedAt: execution.updatedAt || new Date().toISOString()
  };
}

export function normalizeOrder(order = {}) {
  const price = Number(order.price || order.limitPrice || 0);
  const amount = Number(order.amount || 0);

  const quantity =
    Number(order.quantity || 0) > 0
      ? Number(order.quantity)
      : price > 0 && amount > 0
      ? Math.floor(amount / price)
      : 0;

  const gross = Number(order.gross || quantity * price || 0);

  return {
    ...order,
    symbol: String(order.symbol || "").toUpperCase(),
    side: order.side || "BUY",
    price,
    quantity,
    gross,
    amount: amount || gross,
    status: order.status || "PENDING",
    message: order.message || "Waiting for execution"
  };
}