import { userGetItem, userSetItem } from "../auth/userStorage";
import { loadTradeBasket } from "./tradeBasketStore";
import {
  ORDER_STATUS,
  isActiveOrder
} from "./orderLifecycle";

const ACTIVE_BASKET_EXECUTION_KEY = "activeBasketExecution";

export async function createBasketExecution({ forceNew = false } = {}) {
  const existing = await loadBasketExecution();

  if (!forceNew && existing?.orders?.some((order) => isActiveOrder(order.status))) {
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
      status: ORDER_STATUS.REVIEW,
      message: "Pending review before queue",
      createdAt: now,
      updatedAt: now
    })
  );

  const execution = normalizeExecution({
    id: `EXEC-${Date.now()}`,
    basketId: basket.id,
    source: basket.source || "COACH_G",
    status: ORDER_STATUS.REVIEW,
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
    status: ORDER_STATUS.CANCELLED,
    message: "Cancelled before routing"
  });
}

export async function queueExecutionOrders() {
  const execution = await loadBasketExecution();

  if (!execution) return null;

  const orders = execution.orders.map((order) => {
    if (!isActiveOrder(order.status)) return normalizeOrder(order);

    return normalizeOrder({
      ...order,
      status: ORDER_STATUS.QUEUED,
      message: "Queued for broker routing",
      queuedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  return await saveBasketExecution({
    ...execution,
    orders
  });
}

export async function routeExecutionOrder(orderId, broker = {}) {
  return await updateExecutionOrder(orderId, {
    brokerId: broker.id || broker.brokerId || "SIM",
    brokerName: broker.name || broker.brokerName || "Simulation Broker",
    status: ORDER_STATUS.ROUTED,
    message: "Routed to broker",
    routedAt: new Date().toISOString()
  });
}

export async function markBrokerReceived(orderId, brokerPayload = {}) {
  return await updateExecutionOrder(orderId, {
    brokerOrderId: brokerPayload.brokerOrderId || brokerPayload.id || null,
    brokerStatus: brokerPayload.status || ORDER_STATUS.BROKER_RECEIVED,
    status: ORDER_STATUS.BROKER_RECEIVED,
    message: "Broker received order",
    brokerReceivedAt: new Date().toISOString()
  });
}

export async function markExecutionOrderFilled(orderId, trade = {}) {
  return await updateExecutionOrder(orderId, {
    status: ORDER_STATUS.FILLED,
    message: "Filled by broker/simulation",
    trade,
    filledAt: new Date().toISOString()
  });
}

export function getActiveExecutionOrders(execution = {}) {
  return (execution.orders || []).filter((order) => isActiveOrder(order.status));
}

export function normalizeExecution(execution = {}) {
  const orders = Array.isArray(execution.orders)
    ? execution.orders.map(normalizeOrder)
    : [];

  const activeOrders = orders.filter((order) => isActiveOrder(order.status));
  const completedOrders = orders.filter((order) => order.status === ORDER_STATUS.FILLED).length;
  const cancelledOrders = orders.filter((order) => order.status === ORDER_STATUS.CANCELLED).length;
  const rejectedOrders = orders.filter((order) => order.status === ORDER_STATUS.REJECTED).length;
  const failedOrders = rejectedOrders;
  const queuedOrders = orders.filter((order) => order.status === ORDER_STATUS.QUEUED).length;
  const routedOrders = orders.filter((order) =>
    [ORDER_STATUS.ROUTED, ORDER_STATUS.BROKER_RECEIVED, ORDER_STATUS.PARTIAL_FILL].includes(order.status)
  ).length;
  const reviewOrders = orders.filter((order) =>
    [ORDER_STATUS.REVIEW, ORDER_STATUS.PENDING, ORDER_STATUS.DRAFT].includes(order.status)
  ).length;

  let status = execution.status || ORDER_STATUS.REVIEW;

  if (orders.length > 0 && activeOrders.length === 0) {
    status = ORDER_STATUS.FILLED;
  } else if (routedOrders > 0) {
    status = ORDER_STATUS.ROUTED;
  } else if (queuedOrders > 0) {
    status = ORDER_STATUS.QUEUED;
  } else if (reviewOrders > 0) {
    status = ORDER_STATUS.REVIEW;
  }

  return {
    ...execution,
    status,
    totalOrders: orders.length,
    activeOrders: activeOrders.length,
    completedOrders,
    cancelledOrders,
    failedOrders,
    queuedOrders,
    routedOrders,
    reviewOrders,
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
    status: String(order.status || ORDER_STATUS.REVIEW).toUpperCase(),
    message: order.message || "Pending review"
  };
}

export async function deleteExecutionOrder(orderId) {
  const execution = await loadBasketExecution();

  if (!execution) return null;

  const orders = execution.orders.filter((order) => order.id !== orderId);

  return await saveBasketExecution({
    ...execution,
    orders
  });
}

export async function queueSingleOrder(orderId) {
  return await updateExecutionOrder(orderId, {
    status: ORDER_STATUS.QUEUED,
    message: "Queued for broker routing",
    queuedAt: new Date().toISOString()
  });
}