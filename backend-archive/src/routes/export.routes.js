import express from "express";

import { getExecutionQueue } from "../services/orders/executionQueue.service.js";
import { getRealizedPnlAnalytics } from "../services/pnl/realizedPnl.service.js";
import { getComplianceAlerts } from "../services/compliance/compliance.service.js";
import { getSettlementLedger } from "../services/ledger/settlement.service.js";

const router = express.Router();

function toCsv(rows) {
  if (!rows || rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);

  const escape = (value) => {
    if (value === null || value === undefined) return "";
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escape(row[header])).join(",")
    )
  ];

  return lines.join("\n");
}

function sendCsv(res, filename, rows) {
  const csv = toCsv(rows);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  res.send(csv);
}

router.get("/orders.csv", async (req, res) => {
  const orders = await getExecutionQueue();

  const rows = orders.map((order) => ({
    id: order.id,
    symbol: order.symbol,
    side: order.side,
    broker: order.broker,
    status: order.status,
    quantity: order.quantity,
    filledQuantity: order.filledQuantity,
    averageFillPrice: order.averageFillPrice,
    rejectionReason: order.rejectionReason || "",
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  }));

  sendCsv(res, "gatecep-orders.csv", rows);
});

router.get("/pnl.csv", (req, res) => {
  const pnl = getRealizedPnlAnalytics();

  sendCsv(res, "gatecep-pnl.csv", pnl.trades || []);
});

router.get("/compliance.csv", async (req, res) => {
  const compliance = await getComplianceAlerts();

  sendCsv(res, "gatecep-compliance-alerts.csv", compliance.alerts || []);
});

router.get("/settlement.csv", async (req, res) => {
  const settlement = await getSettlementLedger();

  sendCsv(res, "gatecep-settlement-ledger.csv", settlement.ledger || []);
});

export default router;