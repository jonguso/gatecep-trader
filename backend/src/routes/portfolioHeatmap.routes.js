import express from "express";

import {
  getPortfolioHeatmap
} from "../services/portfolio/portfolioHeatmap.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const heatmap = await getPortfolioHeatmap();

    res.json({
      ok: true,
      heatmap
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;