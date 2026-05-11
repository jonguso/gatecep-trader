import express from "express";

import {
  getPositions,
  getPositionBySymbol
} from "../services/positions/position.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    positions: getPositions()
  });
});

router.get("/:symbol", (req, res) => {
  res.json({
    ok: true,
    positions: getPositionBySymbol(req.params.symbol)
  });
});

export default router;