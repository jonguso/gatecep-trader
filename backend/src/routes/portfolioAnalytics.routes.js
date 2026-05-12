import express from "express";

import {
  getPortfolioAllocation
} from "../services/portfolio/portfolioAnalytics.service.js";

const router = express.Router();

router.get("/allocation", async (req, res) => {
  try {
    const allocation = await getPortfolioAllocation();

    res.json({
      ok: true,
      allocation
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;