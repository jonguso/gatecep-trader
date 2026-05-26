import express from "express";
import {
  getExecutionQueue,
  cancelOrder
} from "../services/orders/executionQueue.service.js";
import {
  saveOrder
} from "../repositories/order.repository.js";
import {
  publishEvent
} from "../services/events/eventBus.service.js";
import {
  emitOrderUpdate
} from "../websocket/orders.socket.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const orders = await getExecutionQueue();

  res.json({
    ok: true,
    orders
  });
});

router.post("/:id/cancel", (req, res) => {
  const result = cancelOrder(req.params.id);

  res.json(result);
});

export default router;

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      quantity,
      price
    } = req.body;

    const queue =
      await getExecutionQueue();

    const order = queue.find(
      (item) => item.id === id
    );

    if (!order) {
      return res.status(404).json({
        ok: false,
        error: "ORDER_NOT_FOUND"
      });
    }

    const blockedStatuses = [
      "FILLED",
      "REJECTED",
      "CANCELLED"
    ];

    if (
      blockedStatuses.includes(order.status)
    ) {
      return res.status(400).json({
        ok: false,
        error:
          "Cannot modify completed order"
      });
    }

    if (quantity) {
      order.quantity = Number(quantity);
      order.remainingQuantity =
        Number(quantity) -
        Number(order.filledQuantity || 0);
    }

    if (price) {
      order.price = Number(price);
    }

    order.updatedAt =
      new Date().toISOString();

    order.executionEvents.push({
  status: "MODIFIED",
  message: `Order modified → Qty: ${order.quantity}, Price: ${order.price}`,
  timestamp: new Date().toISOString()
});

    await saveOrder(order);

    emitOrderUpdate(order);

    publishEvent("order:update", order).catch(
  (error) => {
    console.error(
      "Order modify publish failed:",
      error.message
    );
  }
);

    res.json({
      ok: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});