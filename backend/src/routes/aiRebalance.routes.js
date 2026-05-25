import express from "express";

import {
  getAIRebalanceSuggestions
} from "../services/rebalancer/aiRebalance.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const analysis =
      await getAIRebalanceSuggestions();

    return res.json({
      ok: true,
      analysis
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;