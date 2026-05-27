import express from "express";
import {
  getLiquidityDepth
} from "../services/market/liquidityDepth.service.js";

const router = express.Router();

router.get("/:symbol", (req, res) => {
  const symbol = String(req.params.symbol || "")
    .trim()
    .toUpperCase();

  const depth = getLiquidityDepth(symbol);

  res.json({
    ok: true,
    symbol,
    depth
  });
});

export default router;