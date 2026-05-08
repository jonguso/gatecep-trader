import express from "express";
import { getExecutionAnalytics } from "../services/orders/executionAnalytics.service.js";

const router = express.Router();

router.get("/analytics", async (req, res) => {
  try {
    const analytics = await getExecutionAnalytics();

    res.json({
      ok: true,
      analytics
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: "Failed to load execution analytics",
      details: error.message
    });
  }
});

export default router;