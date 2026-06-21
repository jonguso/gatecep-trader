import express from "express";

import {
  getExecutionQueue
} from "../services/orders/executionQueue.service.js";

import {
  calculateExecutionQuality
} from "../services/execution/executionQuality.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const orders = await getExecutionQueue();

    const quality = orders.map((order) =>
      calculateExecutionQuality(order)
    );

    res.json({
      ok: true,
      quality
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/:orderId", async (req, res) => {
  try {
    const orders = await getExecutionQueue();

    const order = orders.find(
      (item) => item.id === req.params.orderId
    );

    if (!order) {
      return res.status(404).json({
        ok: false,
        error: "ORDER_NOT_FOUND"
      });
    }

    res.json({
      ok: true,
      quality: calculateExecutionQuality(order)
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;