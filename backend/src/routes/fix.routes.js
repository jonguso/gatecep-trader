import express from "express";

import {
  getFixSessions
} from "../services/fix/fixGateway.service.js";

const router = express.Router();

router.get("/sessions", (req, res) => {
  try {
    const sessions = getFixSessions();

    res.json({
      ok: true,
      sessions
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;