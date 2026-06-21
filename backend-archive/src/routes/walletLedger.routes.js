import express from "express";

import {
  getWalletLedger
} from "../services/wallet/walletLedger.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    res.json({
      ok: true,
      ledger: getWalletLedger()
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;