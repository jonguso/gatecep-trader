import express from "express";

import {
  getBrokerMirror
} from "../repositories/brokerMirror.repository.js";

import {
  normalizeNseSymbol
} from "../data/nseSecurityMaster.js";

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

    const valuation = filterByClient(
      getBrokerMirror(broker, "valuation"),
      clientNumber,
      cdsNumber
    );

    const holdings = filterByClient(
      getBrokerMirror(broker, "holdings"),
      clientNumber,
      cdsNumber
    );

    const settledLookup = Object.fromEntries(
      holdings.map((item) => [
        normalizeNseSymbol(item.symbol),
        item
      ])
    );

    const unsettled = valuation
      .map((item) => {
        const symbol = normalizeNseSymbol(item.symbol);
        const settled = settledLookup[symbol] || {};

        const currentQty = cleanNumber(item.quantity);
        const settledQty = cleanNumber(settled.quantity);
        const pendingQty = currentQty - settledQty;

        const marketPrice = cleanNumber(
          item.marketPrice ||
            item.price ||
            0
        );

        const pendingValue = Number(
          (pendingQty * marketPrice).toFixed(2)
        );

        let direction = "SETTLED";

        if (pendingQty > 0) {
          direction = "UNSETTLED_BUY";
        }

        if (pendingQty < 0) {
          direction = "UNSETTLED_SELL";
        }

        return {
          broker,
          clientNumber: item.clientNumber || clientNumber,
          cdsNumber: item.cdsNumber || cdsNumber,
          symbol,
          name: item.name || "",
          currentQty,
          settledQty,
          pendingQty,
          marketPrice,
          pendingValue,
          direction
        };
      })
      .filter((item) => item.pendingQty !== 0);

    const totalUnsettledBuyValue = unsettled
      .filter((x) => x.direction === "UNSETTLED_BUY")
      .reduce((sum, x) => sum + Number(x.pendingValue || 0), 0);

    const totalUnsettledSellValue = unsettled
      .filter((x) => x.direction === "UNSETTLED_SELL")
      .reduce((sum, x) => sum + Math.abs(Number(x.pendingValue || 0)), 0);

    res.json({
      ok: true,
      broker,
      clientNumber,
      cdsNumber,
      valuationCount: valuation.length,
      settledHoldingCount: holdings.length,
      totalUnsettledBuyValue: Number(totalUnsettledBuyValue.toFixed(2)),
      totalUnsettledSellValue: Number(totalUnsettledSellValue.toFixed(2)),
      unsettled
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;