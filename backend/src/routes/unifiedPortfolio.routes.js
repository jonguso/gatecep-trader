import express from "express";

import {
  getUnifiedPortfolio
} from "../services/portfolio/unifiedPortfolio.service.js";

const router = express.Router();

router.get("/unified", async (req, res) => {
  try {
    const portfolio = await getUnifiedPortfolio();

    return res.json({
      ok: true,
      portfolio
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;