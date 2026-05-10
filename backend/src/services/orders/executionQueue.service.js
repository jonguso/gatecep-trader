import { emitOrderUpdate } from "../../websocket/orders.socket.js";

import {
  saveOrder,
  saveOrderEvent,
  loadOrders
} from "../../repositories/order.repository.js";

import {
  getPreferredBroker,
  debitBrokerBuyingPower,
  creditBrokerBuyingPower
} from "../brokers/brokerAccounts.service.js";

import {
  recordRealizedTrade
} from "../pnl/realizedPnl.service.js";

import { enqueueExecutionJob } from "../queue/redisExecutionQueue.service.js";

import {
  savePersistentOrder
} from "../../repositories/persistentOrders.repository.js";

import { publishEvent } from "../events/eventBus.service.js";

const executionQueue = [];

const brokerFailoverMap = {
  ABC: "AIB",
  AIB: "ABC"
};

function now() {
  return new Date().toISOString();
}

function publishOrder(order) {
  emitOrderUpdate(order);

  publishEvent("order:update", order).catch((error) => {
    console.error("Order event publish failed:", error.message);
  });
}

function persistOrder(order) {
  saveOrder(order).catch((error) => {
    console.error("Failed to save order:", error.message);
  });

  savePersistentOrder(order).catch((error) => {
    console.error("Failed to save persistent order:", error.message);
  });
}

function addExecutionEvent(order, status, message) {
  const event = {
    status,
    message,
    timestamp: now()
  };

  order.executionEvents.push(event);

  saveOrder(order)
    .then(() => saveOrderEvent(order.id, event))
    .catch((error) => {
      console.error("Failed to save order/order event:", error.message);
    });

  publishEvent("execution:event", {
    orderId: order.id,
    ...event
  }).catch((error) => {
    console.error("Execution event publish failed:", error.message);
  });
}

export function queueOrder(order) {
  const quantity = Number(order.quantity || 0);
  const price = Number(order.price || 0);
  const selectedBroker =
    order.broker || order.brokerId || getPreferredBroker();

  const estimatedTradeValue = quantity * price;

  if (order.side === "BUY") {
    const debit = debitBrokerBuyingPower(
      selectedBroker,
      estimatedTradeValue
    );

    if (!debit.ok) {
      const rejectedOrder = {
        id: `ORD-${Date.now()}`,
        symbol: order.symbol,
        side: order.side,
        quantity,
        price,
        broker: selectedBroker,
        status: "REJECTED",
        brokerStatus: "REJECTED",
        filledQuantity: 0,
        remainingQuantity: quantity,
        averageFillPrice: 0,
        fillPercent: 0,
        retryCount: 0,
        maxRetries: 1,
        rejectionReason: debit.error,
        lastBrokerAttempt: selectedBroker,
        executionEvents: [],
        createdAt: now(),
        updatedAt: now()
      };

      executionQueue.push(rejectedOrder);

      addExecutionEvent(
        rejectedOrder,
        "REJECTED",
        `Order rejected: ${debit.error}.`
      );

      publishOrder(rejectedOrder);
      persistOrder(rejectedOrder);

      return rejectedOrder;
    }
  }

  const queuedOrder = {
    id: `ORD-${Date.now()}`,
    symbol: order.symbol,
    side: order.side,
    quantity,
    price,
    broker: selectedBroker,
    status: "QUEUED",
    brokerStatus: "PENDING",
    filledQuantity: 0,
    remainingQuantity: quantity,
    averageFillPrice: 0,
    fillPercent: 0,
    retryCount: 0,
    maxRetries: 1,
    rejectionReason: null,
    lastBrokerAttempt: selectedBroker,
    executionEvents: [],
    createdAt: now(),
    updatedAt: now()
  };

  executionQueue.push(queuedOrder);

  addExecutionEvent(
    queuedOrder,
    "QUEUED",
    "Order queued inside Gatecep execution engine."
  );

  publishOrder(queuedOrder);
  persistOrder(queuedOrder);

  enqueueExecutionJob(queuedOrder).catch((error) => {
    console.error("Failed to enqueue Redis execution job:", error.message);
  });

  simulateExecution(queuedOrder.id);

  return queuedOrder;
}

export async function getExecutionQueue() {
  const savedOrders = await loadOrders();

  const merged = new Map();

  for (const order of savedOrders) {
    merged.set(order.id, order);
  }

  for (const order of executionQueue) {
    merged.set(order.id, order);
  }

  executionQueue.length = 0;
  executionQueue.push(...merged.values());

  return executionQueue;
}

export function getOrderById(orderId) {
  return executionQueue.find((o) => o.id === orderId);
}

export function cancelOrder(orderId) {
  const order = getOrderById(orderId);

  if (!order) {
    return {
      ok: false,
      error: "ORDER_NOT_FOUND"
    };
  }

  const previousStatus = order.status;
  const blockedStatuses = ["FILLED", "REJECTED", "CANCELLED"];

  if (blockedStatuses.includes(order.status)) {
    return {
      ok: false,
      error: `Cannot cancel order with status ${order.status}`
    };
  }

  if (order.side === "BUY" && order.remainingQuantity > 0) {
    const refundAmount =
      Number(order.remainingQuantity || 0) * Number(order.price || 0);

    creditBrokerBuyingPower(order.broker, refundAmount);
  }

  order.status = "CANCELLED";
  order.brokerStatus = "CANCEL_REQUEST_ACCEPTED";
  order.rejectionReason = null;
  order.updatedAt = now();

  addExecutionEvent(
    order,
    "CANCELLED",
    `Order cancelled successfully while previous status was ${previousStatus}.`
  );

  publishOrder(order);
  persistOrder(order);

  return {
    ok: true,
    order
  };
}

function updateOrder(orderId, updates, eventMessage) {
  const order = getOrderById(orderId);

  if (!order || order.status === "CANCELLED") return;

  Object.assign(order, updates);
  order.updatedAt = now();

  if (eventMessage) {
    addExecutionEvent(order, updates.status || order.status, eventMessage);
  }

  publishOrder(order);
  persistOrder(order);
}

function rejectOrder(orderId, reason) {
  const order = getOrderById(orderId);

  if (
    order &&
    order.side === "BUY" &&
    order.remainingQuantity > 0
  ) {
    const refundAmount =
      Number(order.remainingQuantity || 0) * Number(order.price || 0);

    creditBrokerBuyingPower(order.broker, refundAmount);
  }

  updateOrder(
    orderId,
    {
      status: "REJECTED",
      brokerStatus: "REJECTED",
      rejectionReason: reason
    },
    `Order rejected: ${reason}.`
  );
}

function retryOrder(orderId, reason) {
  const order = getOrderById(orderId);

  if (!order) return;

  if (order.retryCount >= order.maxRetries) {
    rejectOrder(orderId, reason);
    return;
  }

  const nextBroker = brokerFailoverMap[order.broker] || "ABC";

  updateOrder(
    orderId,
    {
      status: "RETRYING",
      brokerStatus: "BROKER_RETRY",
      retryCount: order.retryCount + 1,
      broker: nextBroker,
      lastBrokerAttempt: nextBroker,
      rejectionReason: reason
    },
    `Broker issue detected: ${reason}. Retrying order through ${nextBroker}.`
  );

  setTimeout(() => {
    continueExecutionAfterRetry(orderId);
  }, 1500);
}

function applyFill(orderId, fillQty, fillPrice) {
  const order = getOrderById(orderId);

  if (!order || order.status === "CANCELLED") return;

  const previousFilled = order.filledQuantity;
  const newFilled = Math.min(order.quantity, previousFilled + fillQty);

  const previousValue = previousFilled * order.averageFillPrice;
  const newFillValue = (newFilled - previousFilled) * fillPrice;

  order.filledQuantity = newFilled;
  order.remainingQuantity = Math.max(order.quantity - newFilled, 0);

  order.averageFillPrice =
    newFilled > 0
      ? Number(((previousValue + newFillValue) / newFilled).toFixed(2))
      : 0;

  order.fillPercent =
    order.quantity > 0
      ? Math.round((order.filledQuantity / order.quantity) * 100)
      : 0;

  order.status =
    order.remainingQuantity === 0 ? "FILLED" : "PARTIAL_FILL";

  order.brokerStatus =
    order.status === "FILLED"
      ? "FULLY_FILLED"
      : "PARTIALLY_FILLED";

  order.updatedAt = now();

  const fill = {
    orderId: order.id,
    symbol: order.symbol,
    quantity: newFilled - previousFilled,
    price: fillPrice,
    broker: order.broker,
    timestamp: now()
  };

  publishEvent("execution:fill", fill).catch((error) => {
    console.error("Fill publish failed:", error.message);
  });

  if (order.side === "SELL" && order.status === "FILLED") {
    recordRealizedTrade({
      symbol: order.symbol,
      quantity: order.filledQuantity,
      averageCost: 18.45,
      sellPrice: order.averageFillPrice,
      broker: order.broker
    });
  }

  addExecutionEvent(
    order,
    order.status,
    `${order.status === "FILLED" ? "Final" : "Partial"} fill: ${
      newFilled - previousFilled
    } shares @ KES ${fillPrice}.`
  );

  publishOrder(order);
  persistOrder(order);
}

function simulateExecution(orderId) {
  setTimeout(() => {
    const order = getOrderById(orderId);

    if (!order) return;

    updateOrder(
      orderId,
      {
        status: "ROUTED",
        brokerStatus: "BROKER_RECEIVED",
        lastBrokerAttempt: order.broker
      },
      `Order routed from Gatecep to ${order.broker}.`
    );
  }, 1200);

  setTimeout(() => {
    const order = getOrderById(orderId);

    if (!order) return;

    if (order.quantity <= 0 || order.price <= 0) {
      rejectOrder(orderId, "INVALID_ORDER");
      return;
    }

    if (order.quantity > 10000) {
      rejectOrder(orderId, "ORDER_SIZE_TOO_LARGE");
      return;
    }

    if (order.symbol === "FAIL") {
      retryOrder(orderId, "BROKER_UNAVAILABLE");
      return;
    }

    updateOrder(
      orderId,
      {
        status: "ACCEPTED",
        brokerStatus: "BROKER_ACCEPTED"
      },
      `${order.broker} accepted the order.`
    );
  }, 2800);

  setTimeout(() => {
    const order = getOrderById(orderId);

    if (
      !order ||
      ["REJECTED", "RETRYING", "CANCELLED"].includes(order.status) ||
      order.retryCount > 0
    ) {
      return;
    }

    const firstFillQty = Math.max(
      1,
      Math.floor(order.quantity * 0.45)
    );

    applyFill(orderId, firstFillQty, order.price);
  }, 5000);

  setTimeout(() => {
    const order = getOrderById(orderId);

    if (
      !order ||
      ["REJECTED", "RETRYING", "CANCELLED"].includes(order.status) ||
      order.retryCount > 0 ||
      order.remainingQuantity <= 0
    ) {
      return;
    }

    applyFill(orderId, order.remainingQuantity, order.price);
  }, 8000);
}

function continueExecutionAfterRetry(orderId) {
  const order = getOrderById(orderId);

  if (!order || order.status === "CANCELLED") return;

  updateOrder(
    orderId,
    {
      status: "ROUTED",
      brokerStatus: "BROKER_RECEIVED",
      lastBrokerAttempt: order.broker
    },
    `Retry routed to backup broker ${order.broker}.`
  );

  setTimeout(() => {
    const refreshedOrder = getOrderById(orderId);

    if (!refreshedOrder || refreshedOrder.status === "CANCELLED") return;

    updateOrder(
      orderId,
      {
        status: "ACCEPTED",
        brokerStatus: "BROKER_ACCEPTED"
      },
      `${refreshedOrder.broker} accepted the retry order.`
    );
  }, 1200);

  setTimeout(() => {
    const refreshedOrder = getOrderById(orderId);

    if (
      !refreshedOrder ||
      refreshedOrder.status === "REJECTED" ||
      refreshedOrder.status === "CANCELLED" ||
      refreshedOrder.status !== "ACCEPTED"
    ) {
      return;
    }

    const firstFillQty = Math.max(
      1,
      Math.floor(refreshedOrder.remainingQuantity * 0.5)
    );

    applyFill(orderId, firstFillQty, refreshedOrder.price);
  }, 3500);

  setTimeout(() => {
    const refreshedOrder = getOrderById(orderId);

    if (
      !refreshedOrder ||
      refreshedOrder.status === "CANCELLED" ||
      refreshedOrder.status === "REJECTED" ||
      refreshedOrder.remainingQuantity <= 0
    ) {
      return;
    }

    applyFill(
      orderId,
      refreshedOrder.remainingQuantity,
      refreshedOrder.price
    );
  }, 5500);
}