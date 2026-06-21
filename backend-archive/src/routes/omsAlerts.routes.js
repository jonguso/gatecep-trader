import express from "express";

import {
  getOmsAlerts
} from "../services/alerts/omsAlerts.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const alerts = await getOmsAlerts();

    res.json({
      ok: true,
      alerts
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;