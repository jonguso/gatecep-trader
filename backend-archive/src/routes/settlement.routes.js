import express from "express";

import {
  getSettlementLedger
} from "../services/ledger/settlement.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const settlement =
      await getSettlementLedger();

    res.json({
      ok: true,
      settlement
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;