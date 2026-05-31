import express from "express";

import {
  saveBrokerAccountSummary,
  getBrokerAccountSummary
} from "../repositories/brokerAccountSummary.repository.js";

const router = express.Router();

router.post("/:broker", (req, res) => {
  const summary = saveBrokerAccountSummary(
    req.params.broker,
    req.body
  );

  const netWorth =
    Number(summary.portfolioValue || 0) +
    Number(summary.ledgerBalance || 0) +
    Number(summary.unsettledPurchaseValue || 0) +
    Number(summary.unsettledSaleValue || 0);

  res.json({
    ok: true,
    summary: {
      ...summary,
      netWorth
    }
  });
});

router.get("/:broker", (req, res) => {
  const summary = getBrokerAccountSummary(req.params.broker);

  const netWorth =
    Number(summary.portfolioValue || 0) +
    Number(summary.ledgerBalance || 0) +
    Number(summary.unsettledPurchaseValue || 0) +
    Number(summary.unsettledSaleValue || 0);

  res.json({
    ok: true,
    summary: {
      ...summary,
      netWorth
    }
  });
});

export default router;