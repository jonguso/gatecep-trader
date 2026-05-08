import express from "express";

import {
  getPortfolioPerformance
} from "../services/portfolio/performance.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const performance =
      getPortfolioPerformance();

    res.json({
      ok: true,
      performance
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;