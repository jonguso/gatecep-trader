import express from "express";

import {
  getWalletBalance,
  depositFunds
} from "../services/wallet/cashWallet.service.js";

const router = express.Router();

router.get("/balance", (req, res) => {
  res.json({
    ok: true,
    wallet: getWalletBalance()
  });
});

router.post("/deposit", (req, res) => {
  const result = depositFunds(req.body.amount);

  if (!result.ok) {
    return res.status(400).json(result);
  }

  res.json(result);
});

export default router;