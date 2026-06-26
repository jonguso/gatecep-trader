import express from "express";

import { authRequired } from "../../middleware/authRequired.js";

import {
  createHolding,
  getUserPortfolio,
  getUserPortfolioAccounts
} from "./portfolio.service.js";

const router = express.Router();

router.get("/accounts", authRequired, async (req, res) => {
  try {
    const result = await getUserPortfolioAccounts(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/", authRequired, async (req, res) => {
  try {
    const broker = req.query.broker;

    const result = await getUserPortfolio(req.user.id, { broker });

    res.json({
      ok: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/", authRequired, async (req, res) => {
  try {
    const holding = await createHolding(req.user.id, req.body);

    res.json({
      ok: true,
      holding
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;