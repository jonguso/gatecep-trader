import express from "express";

import {
  getExecutionAdvice
} from "../services/ai/executionAdvisor.service.js";

const router = express.Router();

router.get("/:symbol", (req, res) => {
  try {
    const advice = getExecutionAdvice(
      req.params.symbol
    );

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