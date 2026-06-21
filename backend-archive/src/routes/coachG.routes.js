import express from "express";

import {
  generateCoachGSignals,
  getCoachGPortfolioAdvice
} from "../services/ai/coachG.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    signals: generateCoachGSignals()
  });
});

router.get("/portfolio-advice", async (req, res) => {
  try {
    const advice = await getCoachGPortfolioAdvice();

    res.json({
      ok: true,
      advice
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;

