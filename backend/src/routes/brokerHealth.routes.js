import express from "express";

import {
  getBrokerHealthMetrics
} from "../services/brokers/brokerHealth.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const brokers = await getBrokerHealthMetrics();

    res.json({
      ok: true,
      brokers
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;