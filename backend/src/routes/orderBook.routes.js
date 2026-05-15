import express from "express";

import {
  getOrderBook
} from "../services/market/orderBook.service.js";

const router = express.Router();

router.get("/:symbol", (req, res) => {
  const book = getOrderBook(
    req.params.symbol
  );

  res.json({
    ok: true,
    symbol: req.params.symbol,
    book
  });
});

export default router;