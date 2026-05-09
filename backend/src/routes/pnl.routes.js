import express from "express";

import {
  getRealizedPnlAnalytics
} from "../services/pnl/realizedPnl.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const pnl =
      getRealizedPnlAnalytics();

    res.json({
      ok: true,
      pnl
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;