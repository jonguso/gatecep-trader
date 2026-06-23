import express from "express";

import { authRequired } from "../../middleware/authRequired.js";

import {
  createHolding,
  getUserPortfolio
} from "./portfolio.service.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  try {
    const result = await getUserPortfolio(req.user.id);

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
    const holding = await createHolding(
      req.user.id,
      req.body
    );

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