import express from "express";

import {
  getPortfolio
} from "../services/portfolio/portfolio.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const portfolio = await getPortfolio();

    res.json({
      ok: true,
      portfolio
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;