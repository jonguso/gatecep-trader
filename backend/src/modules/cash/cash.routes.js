import express from "express";
import { authRequired } from "../../middleware/authRequired.js";

import {
  getCashSummary,
  saveCashBalance
} from "./cash.service.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  try {
    const result = await getCashSummary(req.user.id);
    res.json({ ok: true, ...result });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/", authRequired, async (req, res) => {
  try {
    const balance = await saveCashBalance(req.user.id, req.body);
    res.json({ ok: true, balance });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;