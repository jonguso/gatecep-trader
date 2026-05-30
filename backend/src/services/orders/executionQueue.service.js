import { emitOrderUpdate } from "../../websocket/orders.socket.js";
import {
  debitWallet,
  getWalletBalance,
  creditWallet,
  releasePendingOrder,
  settlePendingOrder
} from "../wallet/cashWallet.service.js";
import {
  saveOrder,
  saveOrderEvent,
  loadOrders
} from "../../repositories/order.repository.js";
import {
  addOrderToBook,
  matchOrderBook
} from "../market/orderBook.service.js";
import {
  executeTWAP
} from "../execution/twapExecution.service.js";

import {
  getPreferredBroker,
  creditBrokerBuyingPower
} from "../brokers/brokerAccounts.service.js";

import {
  recordRealizedTrade
} from "../pnl/realizedPnl.service.js";

import { enqueueExecutionJob } from "../queue/redisExecutionQueue.service.js";
import {
  simulateDepthFill
} from "../market/liquidityDepth.service.js";
import {
  selectBestBroker
} from "../execution/smartOrderRouter.service.js";

import {
  savePersistentOrder
} from "../../repositories/persistentOrders.repository.js";

import { matchOrder } from "../matching/matchingEngine.service.js";
import { recordTrade } from "../market/timeSales.service.js";

import { publishEvent } from "../events/eventBus.service.js";

import {
  updatePositionFromFill
} from "../positions/position.service.js";
import {
  createJournalEntry
} from "../journal/tradeJournal.service.js";
import {
  reserveBrokerCash,
  releaseBrokerCash,
  settleBrokerBuy,
  creditBrokerCash
} from "../brokers/brokerCash.service.js";

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

const brokerDecision = selectBestBroker({
  symbol: order.symbol,
  side: order.side,
  quantity,
  price,
  preferredBroker:
    order.broker ||
    order.brokerId ||
    getPreferredBroker()
});

const selectedBroker =
  brokerDecision.selectedBroker;

  const estimatedTradeValue = quantity * price;


if (order.side === "BUY") {
  const wallet = getWalletBalance();

  if (estimatedTradeValue > Number(wallet.balance || 0)) {
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
      rejectionReason: "INSUFFICIENT_WALLET_BALANCE",
      lastBrokerAttempt: selectedBroker,
      executionEvents: [],
      createdAt: now(),
      updatedAt: now()
    };

    executionQueue.push(rejectedOrder);

    addExecutionEvent(
      rejectedOrder,
      "REJECTED",
      "Order rejected: insufficient wallet balance."
    );

    publishOrder(rejectedOrder);
    persistOrder(rejectedOrder);

    return rejectedOrder;
  }

  const debit = debitWallet(
  estimatedTradeValue,
  `BUY reserve ${order.symbol}`
);

  
}

  if (order.side === "BUY") {
  try {
    reserveBrokerCash({
      broker: selectedBroker,
      amount: estimatedTradeValue
    });
  } catch (error) {
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
      rejectionReason: error.message,
      lastBrokerAttempt: selectedBroker,
      executionEvents: [],
      createdAt: now(),
      updatedAt: now()
    };

    executionQueue.push(rejectedOrder);

    addExecutionEvent(
      rejectedOrder,
      "REJECTED",
      `Order rejected: ${error.message}.`
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
  
   routingDecision: brokerDecision,

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

addOrderToBook({
  symbol: queuedOrder.symbol,
  side: queuedOrder.side,
  quantity: queuedOrder.quantity,
  price: queuedOrder.price,
  orderId: queuedOrder.id

});

  addExecutionEvent(
    queuedOrder,
    "QUEUED",
    "Order queued inside Gatecep execution engine."
  );

  publishOrder(queuedOrder);
  persistOrder(queuedOrder);

  enqueueExecutionJob(queuedOrder).catch((error) => {
    console.error(
      "Failed to enqueue Redis execution job:",
      error.message
    );
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
  return executionQueue.find(
    (order) => order.id === orderId
  );
}

export function cancelOrder(orderId) {
  const order = getOrderById(orderId);

  if (!order) {
    return {
      ok: false,
      error: "ORDER_NOT_FOUND"
    };
  }

  const blockedStatuses = [
    "FILLED",
    "REJECTED",
    "CANCELLED"
  ];

  if (blockedStatuses.includes(order.status)) {
    return {
      ok: false,
      error: `Cannot cancel order with status ${order.status}`
    };
  }

  if (
    order.side === "BUY" &&
    order.remainingQuantity > 0
  ) {
    const refundAmount =
      Number(order.remainingQuantity || 0) *
      Number(order.price || 0);

    creditBrokerBuyingPower(
      order.broker,
      refundAmount
    );
  }

if (order.side === "BUY") {
  const reservedAmount =
    Number(order.remainingQuantity || 0) *
    Number(order.price || 0);

  releasePendingOrder(
    reservedAmount,
    `Cancelled order release ${order.symbol}`
  );
releaseBrokerCash({
  broker: order.broker,
  amount: reservedAmount
});
}

  order.status = "CANCELLED";
  order.brokerStatus = "CANCEL_REQUEST_ACCEPTED";
  order.rejectionReason = null;
  order.updatedAt = now();

  addExecutionEvent(
    order,
    "CANCELLED",
    "Order cancelled successfully."
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

  if (!order || order.status === "CANCELLED") {
    return;
  }

  Object.assign(order, updates);
  order.updatedAt = now();

  if (eventMessage) {
    addExecutionEvent(
      order,
      updates.status || order.status,
      eventMessage
    );
  }

  publishOrder(order);
  persistOrder(order);
}

function rejectOrder(orderId, reason) {
  const order = getOrderById(orderId);

if (
  !order ||
  ["FILLED", "CANCELLED"].includes(order.status) ||
  Number(order.remainingQuantity || 0) <= 0
) {
  return;
}

  if (
    order &&
    order.side === "BUY" &&
    order.remainingQuantity > 0
  ) {
    const refundAmount =
      Number(order.remainingQuantity || 0) *
      Number(order.price || 0);

    creditBrokerBuyingPower(
      order.broker,
      refundAmount
    );
  }
if (order && order.side === "BUY") {
  const reservedAmount =
    Number(order.remainingQuantity || 0) *
    Number(order.price || 0);

  releasePendingOrder(
    reservedAmount,
    `Rejected order release ${order.symbol}`
  );
releaseBrokerCash({
  broker: order.broker,
  amount: reservedAmount
});
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

  if (!order) {
    return;
  }

  if (order.retryCount >= order.maxRetries) {
    rejectOrder(orderId, reason);
    return;
  }

  const nextBroker =
    brokerFailoverMap[order.broker] || "ABC";

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

async function applyFill(orderId, fillQty, fillPrice) {
  const order = getOrderById(orderId);

  if (
  !order ||
  ["CANCELLED", "REJECTED", "FILLED"].includes(order.status) ||
  Number(order.remainingQuantity || 0) <= 0
) {
  return;
}

  const previousFilled =
    Number(order.filledQuantity || 0);

  const requestedFillQty = Math.min(
    Number(order.quantity || 0) - previousFilled,
    Number(fillQty || 0)
  );

 const matchResult = simulateDepthFill({
  symbol: order.symbol,
  side: order.side,
  quantity: requestedFillQty,
  limitPrice: Number(fillPrice || 0)
});

  const matchedQty =
    Number(matchResult.filledQuantity || 0);

  const matchedPrice =
    Number(matchResult.averagePrice || fillPrice);

  if (matchedQty <= 0) {
    order.status = "REJECTED";
    order.brokerStatus = "NO_LIQUIDITY";
    order.rejectionReason = "NO_MATCHING_LIQUIDITY";
    order.updatedAt = now();

    addExecutionEvent(
      order,
      "REJECTED",
      "Order rejected: no matching liquidity available."
    );

    publishOrder(order);
    persistOrder(order);

    return;
  }

  const newFilled = Math.min(
    Number(order.quantity || 0),
    previousFilled + matchedQty
  );

  const previousValue =
    previousFilled *
    Number(order.averageFillPrice || 0);

  const newFillValue =
    matchedQty * matchedPrice;

  order.filledQuantity = newFilled;

  order.remainingQuantity = Math.max(
    Number(order.quantity || 0) - newFilled,
    0
  );

  order.averageFillPrice =
    newFilled > 0
      ? Number(
          (
            (previousValue + newFillValue) /
            newFilled
          ).toFixed(2)
        )
      : 0;

  order.fillPercent =
    Number(order.quantity || 0) > 0
      ? Math.round(
          (order.filledQuantity /
            Number(order.quantity || 0)) *
            100
        )
      : 0;

  order.status =
    order.remainingQuantity === 0
      ? "FILLED"
      : "PARTIAL_FILL";

  order.brokerStatus =
    order.status === "FILLED"
      ? "FULLY_FILLED"
      : "PARTIALLY_FILLED";

  order.updatedAt = now();

  const fill = {
    orderId: order.id,
    symbol: order.symbol,
    quantity: matchedQty,
    price: matchedPrice,
    broker: order.broker,
    timestamp: now()
  };

  const trade = recordTrade({
    orderId: order.id,
    symbol: order.symbol,
    side: order.side,
    quantity: matchedQty,
    price: matchedPrice,
    broker: order.broker
  });

  publishEvent("orderbook:update", {
    symbol: order.symbol,
    book: matchResult.book,
    updatedAt: now()
  }).catch((error) => {
    console.error(
      "Order book publish failed:",
      error.message
    );
  });

  publishEvent("time-sales:trade", trade).catch(
    (error) => {
      console.error(
        "Time sales publish failed:",
        error.message
      );
    }
  );

  await updatePositionFromFill({
    symbol: order.symbol,
    side: order.side,
    quantity: matchedQty,
    price: matchedPrice,
    broker: order.broker
  });

if (order.side === "BUY") {
  settlePendingOrder(
    matchedQty * matchedPrice,
    `BUY settlement ${order.symbol}`
  );
settleBrokerBuy({
  broker: order.broker,
  amount: matchedQty * matchedPrice
});
}

  if (order.side === "SELL") {
    creditWallet(
      matchedQty * matchedPrice,
      `SELL ${order.symbol} wallet credit`
    );
creditBrokerCash({
  broker: order.broker,
  amount: matchedQty * matchedPrice
});
  }

  publishEvent("portfolio:update", {
    orderId: order.id,
    symbol: order.symbol,
    side: order.side,
    quantity: matchedQty,
    price: matchedPrice,
    broker: order.broker,
    status: order.status,
    updatedAt: now()
  }).catch((error) => {
    console.error(
      "Portfolio update publish failed:",
      error.message
    );
  });

  publishEvent("execution:fill", fill).catch(
    (error) => {
      console.error(
        "Fill publish failed:",
        error.message
      );
    }
  );

  if (
    order.side === "SELL" &&
    order.status === "FILLED"
  ) {
    recordRealizedTrade({
      symbol: order.symbol,
      quantity: order.filledQuantity,
      averageCost: 18.45,
      sellPrice: order.averageFillPrice,
      broker: order.broker
    });
  }

  if (order.status === "FILLED") {
    createJournalEntry({
      symbol: order.symbol,
      side: order.side,
      broker:
        order.broker ||
        order.lastBrokerAttempt ||
        "AUTO",
      quantity: Number(
        order.filledQuantity ||
          order.quantity ||
          0
      ),
      entryPrice: Number(
        order.averageFillPrice ||
          order.price ||
          0
      ),
      currentPrice: Number(
        order.averageFillPrice ||
          order.price ||
          0
      ),
      aiConfidence: 85,
      reason:
        "Auto-journaled from filled order",
      holdingDays: 0
    });
  }

addExecutionEvent(
  order,
  order.status,
  `${
    order.status === "FILLED"
      ? "Final"
      : "Partial"
  } fill: ${matchedQty} shares @ VWAP KES ${matchedPrice}. Slippage: ${
    matchResult.slippagePct || 0
  }%.`
);

  publishOrder(order);
  persistOrder(order);
}

function simulateExecution(orderId) {
  setTimeout(() => {
    const order = getOrderById(orderId);

    if (!order) {
      return;
    }

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

    if (!order) {
      return;
    }

    if (
      Number(order.quantity || 0) <= 0 ||
      Number(order.price || 0) <= 0
    ) {
      rejectOrder(orderId, "INVALID_ORDER");
      return;
    }

    if (Number(order.quantity || 0) > 10000) {
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

const matchedTrade = matchOrderBook(order.symbol);

if (matchedTrade) {
  console.log("Matched trade:", matchedTrade);

  applyFill(
    matchedTrade.buyOrderId,
    matchedTrade.quantity,
    matchedTrade.price
  );

  applyFill(
    matchedTrade.sellOrderId,
    matchedTrade.quantity,
    matchedTrade.price
  );

  creditWallet(
    matchedTrade.quantity * matchedTrade.price,
    `SELL ${order.symbol} wallet credit`
  );

  publishEvent("orderbook:matched", matchedTrade).catch((error) => {
    console.error("Order book match publish failed:", error.message);
  });
}

  }, 2800);

  setTimeout(() => {
    const order = getOrderById(orderId);

    if (
      !order ||
      [
        "REJECTED",
        "RETRYING",
        "CANCELLED"
      ].includes(order.status) ||
      order.retryCount > 0
    ) {
      return;
    }

    const firstFillQty = Math.max(
      1,
      Math.floor(
        Number(order.quantity || 0) * 0.45
      )
    );

    applyFill(
      orderId,
      firstFillQty,
      Number(order.price || 0)
    );
  }, 5000);

  setTimeout(() => {
    const order = getOrderById(orderId);

    if (
      !order ||
      [
        "REJECTED",
        "RETRYING",
        "CANCELLED"
      ].includes(order.status) ||
      order.retryCount > 0 ||
      Number(order.remainingQuantity || 0) <= 0
    ) {
      return;
    }

    applyFill(
      orderId,
      Number(order.remainingQuantity || 0),
      Number(order.price || 0)
    );
  }, 8000);
}

function continueExecutionAfterRetry(orderId) {
  const order = getOrderById(orderId);

  if (!order || order.status === "CANCELLED") {
    return;
  }

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
    const refreshedOrder =
      getOrderById(orderId);

    if (
      !refreshedOrder ||
      refreshedOrder.status === "CANCELLED"
    ) {
      return;
    }

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
    const refreshedOrder =
      getOrderById(orderId);

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
      Math.floor(
        Number(
          refreshedOrder.remainingQuantity || 0
        ) * 0.5
      )
    );

    applyFill(
      orderId,
      firstFillQty,
      Number(refreshedOrder.price || 0)
    );
  }, 3500);

  setTimeout(() => {
    const refreshedOrder =
      getOrderById(orderId);

    if (
      !refreshedOrder ||
      refreshedOrder.status === "CANCELLED" ||
      refreshedOrder.status === "REJECTED" ||
      Number(refreshedOrder.remainingQuantity || 0) <= 0
    ) {
      return;
    }

    applyFill(
      orderId,
      Number(refreshedOrder.remainingQuantity || 0),
      Number(refreshedOrder.price || 0)
    );
  }, 5500);
}

export function clearExecutionQueue() {
  executionQueue.length = 0;
}

export function resetExecutionQueue() {
  executionQueue.length = 0;

  console.log(
    "Execution queue memory cleared."
  );

  return {
    ok: true
  };
}