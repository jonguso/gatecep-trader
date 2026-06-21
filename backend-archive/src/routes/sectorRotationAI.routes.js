import express from "express";

import {
  getSectorRotationAI
} from "../services/market/sectorRotationAI.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const analysis =
      await getSectorRotationAI();

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