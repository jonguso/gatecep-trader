import express from "express";

import {
  getBrokerMirror
} from "../repositories/brokerMirror.repository.js";

const router = express.Router();

function normalizeBroker(value) {
  const broker = String(value || "AIB-AXYS").trim().toUpperCase();

  if (broker === "AIB") return "AIB-AXYS";
  if (broker === "ABC CAPITAL") return "ABC";

  return broker;
}

function cleanNumber(value) {
  const cleaned = String(value ?? 0)
    .replaceAll(",", "")
    .replaceAll("'", "")
    .replace(/KES/gi, "")
    .trim();

  const num = Number(cleaned);

  return Number.isFinite(num) ? num : 0;
}

function filterByClient(rows = [], clientNumber = "", cdsNumber = "") {
  if (!clientNumber && !cdsNumber) return rows;

  return rows.filter((row) => {
    const rowClient = String(row.clientNumber || "").trim();
    const rowCds = String(row.cdsNumber || "").trim();

    return (
      (!clientNumber || rowClient === String(clientNumber).trim()) &&
      (!cdsNumber || rowCds === String(cdsNumber).trim())
    );
  });
}

router.get("/:broker", (req, res) => {
  try {
    const broker = normalizeBroker(req.params.broker);
    const clientNumber = String(req.query.clientNumber || "").trim();
    const cdsNumber = String(req.query.cdsNumber || "").trim();

    const cashRows = filterByClient(
      getBrokerMirror(broker, "cash"),
      clientNumber,
      cdsNumber
    );

    let runningBalance = 0;

    cashRows.forEach((row) => {
      const debit = cleanNumber(row.debit);
      const credit = cleanNumber(row.credit);
      const explicitBalance = cleanNumber(
        row.balance ||
          row.ledgerBalance ||
          row.availableCash
      );

      if (explicitBalance !== 0) {
        runningBalance = explicitBalance;
      } else {
        runningBalance = runningBalance + credit - debit;
      }
    });

    const latestRow =
      cashRows.length > 0
        ? cashRows[cashRows.length - 1]
        : null;

    const ledgerBalance = Number(runningBalance.toFixed(2));

    const totalCredits = cashRows.reduce(
      (sum, row) => sum + cleanNumber(row.credit),
      0
    );

    const totalDebits = cashRows.reduce(
      (sum, row) => sum + cleanNumber(row.debit),
      0
    );

    res.json({
      ok: true,
      broker,
      clientNumber,
      cdsNumber,
      rows: cashRows.length,
      ledgerBalance,
      availableFunds: ledgerBalance,
      totalCredits: Number(totalCredits.toFixed(2)),
      totalDebits: Number(totalDebits.toFixed(2)),
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