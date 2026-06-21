import express from "express";

import {
  getExecutionQueue
} from "../services/orders/executionQueue.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const orders = await getExecutionQueue();

    let filtered = [...orders];

    const {
      symbol,
      broker,
      status
    } = req.query;

    if (symbol) {
      filtered = filtered.filter((o) =>
        o.symbol?.toLowerCase().includes(
          symbol.toLowerCase()
        )
      );
    }

    if (broker) {
      filtered = filtered.filter(
        (o) => o.broker === broker
      );
    }

    if (status) {
      filtered = filtered.filter(
        (o) => o.status === status
      );
    }

    filtered.sort(
      (a, b) =>
        new Date(b.updatedAt) -
        new Date(a.updatedAt)
    );

    res.json({
      ok: true,
      orders: filtered
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;