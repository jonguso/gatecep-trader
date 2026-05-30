import express from "express";

import {
  getBrokerMirror
} from "../repositories/brokerMirror.repository.js";

import { marketDataGateway } from "../services/marketData/MarketDataGateway.js";

const router = express.Router();

router.get("/:broker", async (req, res) => {
  try {
    const broker = String(req.params.broker || "AIB").toUpperCase();

    const holdings = getBrokerMirror(
      broker,
      "holdings"
    );

    const pricesResult = await marketDataGateway.getPrices();

    const priceLookup = Object.fromEntries(
      (pricesResult.data || []).map((item) => [
        String(item.symbol || item.code || "")
          .trim()
          .replace(".NR", ""),
        Number(
          item.price ||
            item.lastPrice ||
            item.currentPrice ||
            item.marketPrice ||
            0
        )
      ])
    );

    const portfolio = holdings.map((h) => {
      const symbol = String(h.symbol || "").trim();
      const quantity = Number(h.quantity || 0);
      const price = Number(priceLookup[symbol] || 0);
      const marketValue = quantity * price;

      return {
        symbol,
        name: h.name,
        quantity,
        price,
        marketValue,
        weight: 0
      };
    });

    const totalValue = portfolio.reduce(
      (sum, item) => sum + Number(item.marketValue || 0),
      0
    );

    portfolio.forEach((item) => {
      item.weight =
        totalValue > 0
          ? Number(
              (
                (Number(item.marketValue || 0) / totalValue) *
                100
              ).toFixed(2)
            )
          : 0;
    });

    res.json({
      ok: true,
      broker,
      totalValue,
      holdings: portfolio
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;