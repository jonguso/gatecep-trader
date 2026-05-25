import express from "express";

import {
  getPortfolioScore
} from "../services/portfolio/portfolioScore.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const score =
      await getPortfolioScore();

    return res.json({
      ok: true,
      score
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;