import express from "express";

import {
  getSmartBrokerScores,
  getBestExecutionBroker
} from "../services/brokers/smartBrokerScore.service.js";

const router = express.Router();

router.get("/scores", async (req, res) => {
  try {
    const scores =
      await getSmartBrokerScores();

    res.json({
      ok: true,
      scores
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/best", async (req, res) => {
  try {
    const broker =
      await getBestExecutionBroker();

    res.json({
      ok: true,
      broker
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;