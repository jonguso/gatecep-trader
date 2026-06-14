import { userGetItem, userSetItem } from "../auth/userStorage";
import { loadTradeBasket } from "./tradeBasketStore";

const ACTIVE_BASKET_EXECUTION_KEY = "activeBasketExecution";

export async function createBasketExecution() {
  const existing = await loadBasketExecution();

  if (existing?.orders?.length) {
    return existing;
  }

  const basket = await loadTradeBasket();

  if (!basket?.items?.length) {
    return null;
  }

  const now = new Date().toISOString();

  const orders = basket.items.map((item, index) =>
    normalizeOrder({
      id: `EO-${Date.now()}-${index}`,
      basketItemId: item.id || `BI-${index}`,
      symbol: item.symbol,
      name: item.name || item.symbol,
      sector: item.sector || "NSE",
      side: item.side || "BUY",
      amount: Number(item.amount || 0),
      quantity: Number(item.quantity || 0),
      price: Number(item.price || item.limitPrice || 0),
      reason: item.reason || "Coach G recommendation",
      status: "PENDING",
      message: "Pending review",
      createdAt: now,
      updatedAt: now
    })
  );

  const execution = normalizeExecution({
    id: `EXEC-${Date.now()}`,
    basketId: basket.id,
    source: basket.source || "COACH_G",
    status: "PENDING_REVIEW",
    totalOrders: orders.length,
    completedOrders: 0,
    failedOrders: 0,
    cancelledOrders: 0,
    createdAt: now,
    updatedAt: now,
    orders
  });

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

export async function cancelExecutionOrder(orderId) {
  return await updateExecutionOrder(orderId, {
    status: "CANCELLED",
    message: "Cancelled before queue"
  });
}

export async function queueExecutionOrders() {
  const execution = await loadBasketExecution();

  if (!execution) return null;

  const orders = execution.orders.map((order) => {
    if (["FILLED", "CANCELLED", "FAILED"].includes(order.status)) {
      return normalizeOrder(order);
    }

    return normalizeOrder({
      ...order,
      status: "QUEUED",
      message: "Queued for basket execution",
      queuedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  return await saveBasketExecution({
    ...execution,
    status: "QUEUED",
    orders
  });
}

export function normalizeExecution(execution = {}) {
  const orders = Array.isArray(execution.orders)
    ? execution.orders.map(normalizeOrder)
    : [];

  const activeOrders = orders.filter((order) => order.status !== "CANCELLED");
  const completedOrders = orders.filter((order) => order.status === "FILLED").length;
  const failedOrders = orders.filter((order) => order.status === "FAILED").length;
  const cancelledOrders = orders.filter((order) => order.status === "CANCELLED").length;
  const queuedOrders = orders.filter((order) => order.status === "QUEUED").length;
  const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
  const totalOrders = orders.length;

  let status = execution.status || "PENDING_REVIEW";

  if (activeOrders.length > 0 && completedOrders === activeOrders.length) {
    status = "COMPLETED";
  } else if (failedOrders > 0 && completedOrders > 0) {
    status = "PARTIAL";
  } else if (queuedOrders > 0) {
    status = "QUEUED";
  } else if (pendingOrders > 0) {
    status = "PENDING_REVIEW";
  } else if (cancelledOrders === totalOrders && totalOrders > 0) {
    status = "CANCELLED";
  }

  return {
    ...execution,
    status,
    totalOrders,
    activeOrders: activeOrders.length,
    completedOrders,
    failedOrders,
    cancelledOrders,
    pendingOrders,
    queuedOrders,
    totalAmount: activeOrders.reduce(
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

  const gross = quantity * price;

  return {
    ...order,
    symbol: String(order.symbol || "").toUpperCase(),
    side: order.side || "BUY",
    price,
    quantity,
    gross,
    amount: amount || gross,
    status: order.status || "PENDING",
    message: order.message || "Pending review"
  };
}