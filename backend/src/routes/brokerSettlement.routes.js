import express from "express";

import {
  getBrokerMirror
} from "../repositories/brokerMirror.repository.js";

import {
  normalizeNseSymbol
} from "../data/nseSecurityMaster.js";

const router = express.Router();

router.get("/:broker", (req, res) => {
  try {
    const broker = String(req.params.broker || "AIB").toUpperCase();

    const valuation = getBrokerMirror(broker, "valuation");
    const holdings = getBrokerMirror(broker, "holdings");

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

        const currentQty = Number(item.quantity || 0);
        const settledQty = Number(settled.quantity || 0);
        const pendingQty = currentQty - settledQty;

        const marketPrice = Number(
          item.marketPrice ||
          item.price ||
          0
        );

        const pendingValue = Number(
          (
            pendingQty *
            marketPrice
          ).toFixed(2)
        );

        let direction = "SETTLED";

        if (pendingQty > 0) {
          direction = "UNSETTLED_BUY";
        }

        if (pendingQty < 0) {
          direction = "UNSETTLED_SELL";
        }

        return {
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