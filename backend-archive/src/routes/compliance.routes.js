import express from "express";

import {
  getComplianceAlerts
} from "../services/compliance/compliance.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const compliance =
      await getComplianceAlerts();

    res.json({
      ok: true,
      compliance
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;