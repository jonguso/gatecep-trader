import express from "express";

import {
  splitOrder
} from "../services/orders/orderSplitter.service.js";

const router = express.Router();

router.post("/", (req, res) => {
  try {
    const result = splitOrder(req.body);

    res.json({
      ok: true,
      split: result
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;