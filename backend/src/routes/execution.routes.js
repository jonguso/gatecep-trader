import express from "express";

import {
  queueOrder,
  getExecutionQueue,
  getOrderById,
  cancelOrder
} from "../services/orders/executionQueue.service.js";

import { getExecutionAnalytics } from "../services/orders/executionAnalytics.service.js";

import { getSmartRoutingRecommendation } from "../services/orders/smartRouter.service.js";

const router = express.Router();

router.post("/execute", (req, res) => {
  const order = queueOrder(req.body);

  res.json({
    ok: true,
    order
  });
});

router.get("/analytics", async (req, res) => {
  try {
    const analytics = await getExecutionAnalytics();

    res.json({
      ok: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/smart-routing", async (req, res) => {
  try {
    const recommendation = await getSmartRoutingRecommendation();

    res.json({
      ok: true,
      recommendation
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/queue", async (req, res) => {
  const queue = await getExecutionQueue();

  res.json({
    ok: true,
    queue
  });
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

router.post("/:orderId/cancel", (req, res) => {
  const result = cancelOrder(req.params.orderId);

  if (!result.ok) {
    return res.status(400).json(result);
  }

  res.json(result);
});

export default router;