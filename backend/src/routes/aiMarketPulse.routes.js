import express from "express";

import {
  getAIMarketPulse
} from "../services/market/aiMarketPulse.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pulse =
      await getAIMarketPulse();

    return res.json({
      ok: true,
      pulse
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;