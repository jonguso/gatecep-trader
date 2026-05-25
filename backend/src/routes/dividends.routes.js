import express from "express";

import {
  getDividendCalendar,
  getDividendBySymbol
} from "../services/dividends/dividendCalendar.service.js";
import {
  getDividendAIScores
} from "../services/dividends/dividendAI.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    return res.json({
      ok: true,
      dividends: getDividendCalendar()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/ai/scores", (req, res) => {
  try {
    return res.json({
      ok: true,
      scores: getDividendAIScores()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/:symbol", (req, res) => {
  try {
    return res.json({
      ok: true,
      dividends: getDividendBySymbol(req.params.symbol)
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;