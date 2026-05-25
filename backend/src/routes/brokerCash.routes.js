import express from "express";

import {
  getBrokerCashBalances,
  getBrokerCash,
  reserveBrokerCash,
  releaseBrokerCash,
  settleBrokerBuy,
  creditBrokerCash
} from "../services/brokers/brokerCash.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    return res.json({
      ok: true,
      brokers: getBrokerCashBalances()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/:broker", (req, res) => {
  try {
    return res.json({
      ok: true,
      broker: getBrokerCash(
        req.params.broker
      )
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/reserve", (req, res) => {
  try {
    const broker = reserveBrokerCash(
      req.body
    );

    return res.json({
      ok: true,
      broker
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/release", (req, res) => {
  try {
    const broker = releaseBrokerCash(
      req.body
    );

    return res.json({
      ok: true,
      broker
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/settle-buy", (req, res) => {
  try {
    const broker = settleBrokerBuy(
      req.body
    );

    return res.json({
      ok: true,
      broker
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/credit", (req, res) => {
  try {
    const broker = creditBrokerCash(
      req.body
    );

    return res.json({
      ok: true,
      broker
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;