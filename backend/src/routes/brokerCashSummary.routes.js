import express from "express";

import {
  getBrokerMirror
} from "../repositories/brokerMirror.repository.js";

const router = express.Router();

function cleanNumber(value) {
  return Number(
    String(value || 0)
      .replaceAll(",", "")
      .replaceAll("'", "")
      .trim()
  );
}

router.get("/:broker", (req, res) => {
  try {
    const broker = String(req.params.broker || "AIB").toUpperCase();

    const cashRows = getBrokerMirror(
      broker,
      "cash"
    );

    const latestRow =
      cashRows.length > 0
        ? cashRows[cashRows.length - 1]
        : null;

    const ledgerBalance =
      latestRow
        ? cleanNumber(
            latestRow.balance ||
            latestRow.ledgerBalance ||
            latestRow.availableCash ||
            0
          )
        : 0;

    const totalCredits = cashRows.reduce(
      (sum, row) =>
        sum + cleanNumber(row.credit),
      0
    );

    const totalDebits = cashRows.reduce(
      (sum, row) =>
        sum + cleanNumber(row.debit),
      0
    );

    res.json({
      ok: true,
      broker,
      rows: cashRows.length,
      ledgerBalance,
      totalCredits,
      totalDebits,
      latestActivity: latestRow
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;