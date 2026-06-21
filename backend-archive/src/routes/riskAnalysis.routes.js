import express from "express";

import {
  getPortfolioRiskAnalysis
} from "../services/portfolio/riskAnalysis.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const analysis =
      await getPortfolioRiskAnalysis();

    res.json({
      ok: true,
      analysis
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;