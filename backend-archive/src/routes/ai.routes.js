import express from "express";

import {
  generateCoachGSignals
} from "../services/ai/coachG.service.js";

const router = express.Router();

router.get("/signals", (req, res) => {
  try {
    const signals =
      generateCoachGSignals();

    res.json({
      ok: true,
      signals
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;