import express from "express";

import {
  getBrokerAccounts,
  setPreferredBroker
} from "../services/brokers/brokerAccounts.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const accounts =
      getBrokerAccounts();

    res.json({
      ok: true,
      accounts
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/preferred", (req, res) => {
  try {
    const accounts =
      setPreferredBroker(
        req.body.broker
      );

    res.json({
      ok: true,
      accounts
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;