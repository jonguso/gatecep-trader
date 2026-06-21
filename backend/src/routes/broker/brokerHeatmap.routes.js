import express from "express";

import {
  getBrokerMirror
} from "../../repositories/brokerMirror.repository.js";

import {
  marketDataGateway
} from "../../services/marketData/MarketDataGateway.js";

import {
  normalizeNseSymbol
} from "../../data/nseSecurityMaster.js";

const router = express.Router();

router.get("/:broker", async (req, res) => {
  try {
    const broker = String(req.params.broker || "AIB-AXYS").toUpperCase();

    const clientNumber = String(req.query.clientNumber || "");
    const cdsNumber = String(req.query.cdsNumber || "");

    const valuations = getBrokerMirror(
      broker,
      "valuation",
      clientNumber,
      cdsNumber
    );

    const holdings =
      valuations.length > 0
        ? valuations
        : getBrokerMirror(
            broker,
            "holdings",
            clientNumber,
            cdsNumber
          );

    const prices = await marketDataGateway.getPrices();

    const lookup = Object.fromEntries(
      (prices.data || []).map((x) => [
        normalizeNseSymbol(x.symbol),
        x
      ])
    );

    const enriched = holdings.map((h) => {
      const symbol = normalizeNseSymbol(h.symbol);
      const market = lookup[symbol] || {};

      const quantity = Number(h.quantity || 0);

      const price = Number(
        h.marketPrice ||
          h.price ||
          market.price ||
          market.lastPrice ||
          0
      );

      const value = Number(
        h.marketValue ||
          h.value ||
          quantity * price ||
          0
      );

      const sector =
        h.sector ||
        market.sector ||
        "Unknown";

      const changePct = Number(
        h.profitLossPct ||
          h.changePct ||
          market.changePct ||
          0
      );

      const profitLoss = Number(
        h.profitLoss ||
          h.unrealizedPnL ||
          0
      );

      return {
        broker,
        clientNumber,
        cdsNumber,
        symbol,
        sector,
        quantity,
        price,
        value,
        profitLoss,
        changePct,
        intensity: Math.abs(changePct)
      };
    });

    res.json({
      ok: true,
      broker,
      clientNumber,
      cdsNumber,
      source: valuations.length > 0 ? "VALUATION" : "HOLDINGS",
      count: enriched.length,
      heatmap: enriched
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;