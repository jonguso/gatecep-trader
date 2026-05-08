import express from "express";

import {
  getOrderBook
} from "../services/market/orderBook.service.js";

const router = express.Router();

router.get("/:symbol", (req, res) => {
  try {
    const book = getOrderBook(req.params.symbol);

    res.json({
      ok: true,
      book
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;