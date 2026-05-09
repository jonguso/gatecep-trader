import express from "express";

import {
  getRebalancePlan
} from "../services/portfolio/rebalancer.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const plan = await getRebalancePlan();

    res.json({
      ok: true,
      plan
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;