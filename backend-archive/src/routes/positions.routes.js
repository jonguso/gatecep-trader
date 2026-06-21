import express from "express";

import {
  getPositions,
  getPositionBySymbol
} from "../services/positions/position.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const positions = await getPositions();

  res.json({
    ok: true,
    positions
  });
});

router.get("/:symbol", async (req, res) => {
  const position = await getPositionBySymbol(req.params.symbol);

  res.json({
    ok: true,
    position
  });
});

export default router;