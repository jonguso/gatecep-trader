import express from "express";

import {
  getTimeSales
} from "../services/market/timeSales.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  const trades = getTimeSales({
    symbol: req.query.symbol
      ? String(req.query.symbol).toUpperCase()
      : null
  });

  res.json({
    ok: true,
    trades
  });
});

export default router;