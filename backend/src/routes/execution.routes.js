import express from "express";
import {
  queueOrder,
  getExecutionQueue,
  getOrderById,
  cancelOrder
} from "../services/orders/executionQueue.service.js";

const router = express.Router();

router.post("/execute", (req, res) => {
  const order = queueOrder(req.body);

  res.json({
    ok: true,
    order
  });
});

router.get("/queue", (req, res) => {
  res.json({
    ok: true,
    queue: getExecutionQueue()
  });
});

router.post("/:orderId/cancel", (req, res) => {
  const result = cancelOrder(req.params.orderId);

  if (!result.ok) {
    return res.status(400).json(result);
  }

  res.json(result);
});

router.get("/:orderId", (req, res) => {
  const order = getOrderById(req.params.orderId);

  if (!order) {
    return res.status(404).json({
      ok: false,
      error: "Order not found"
    });
  }

  res.json({
    ok: true,
    order
  });
});

export default router;