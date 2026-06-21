import express from "express";

import {
  getSmartRoutingRecommendation
} from "../services/orders/smartRouter.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const recommendation =
      await getSmartRoutingRecommendation();

    res.json({
      ok: true,
      recommendation
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;