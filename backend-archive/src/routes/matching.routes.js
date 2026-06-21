import express from "express";

import {
  getOrderBook,
  matchOrder
} from "../services/matching/matchingEngine.service.js";

const router = express.Router();

router.get("/book/:symbol", (req, res) => {
  const book = getOrderBook(
    req.params.symbol.toUpperCase()
  );

  res.json({
    ok: true,
    symbol: req.params.symbol.toUpperCase(),
    book
  });
});

router.post("/match", (req, res) => {
  const result = matchOrder({
    symbol: String(req.body.symbol || "SCOM").toUpperCase(),
    side: req.body.side,
    quantity: Number(req.body.quantity || 0),
    limitPrice: Number(req.body.price || req.body.limitPrice || 0)
  });

  res.json({
    ok: true,
    result
  });
});

export default router;