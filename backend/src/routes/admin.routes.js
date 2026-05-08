import express from "express";

import {
  getAdminDashboard
} from "../services/admin/adminDashboard.service.js";

const router = express.Router();

router.get("/dashboard", async (req, res) => {
  try {
    const dashboard =
      await getAdminDashboard();

    res.json({
      ok: true,
      dashboard
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;