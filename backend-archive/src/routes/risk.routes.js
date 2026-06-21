import express from "express";

import {
  getPortfolioRisk
} from "../services/risk/portfolioRisk.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const risk = await getPortfolioRisk();

    res.json({
      ok: true,
      risk
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;