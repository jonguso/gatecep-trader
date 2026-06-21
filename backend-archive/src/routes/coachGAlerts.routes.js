import express from "express";

import {
  generateCoachGAlerts,
  getLatestCoachGAlerts
} from "../services/ai/coachGAlerts.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const alerts = await generateCoachGAlerts();

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

router.get("/latest", (req, res) => {
  res.json({
    ok: true,
    alerts: getLatestCoachGAlerts()
  });
});

export default router;