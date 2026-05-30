import express from "express";

import {
  getBrokerMirror
} from "../repositories/brokerMirror.repository.js";

import {
  getBrokerMirrorActions
} from "../repositories/brokerMirrorActions.repository.js";

import {
  marketDataGateway
} from "../services/marketData/MarketDataGateway.js";

const router = express.Router();

router.get("/:broker", async (req, res) => {
  try {
    const broker = String(req.params.broker || "AIB").toUpperCase();

    const holdings = getBrokerMirror(broker, "holdings");
    const actions = getBrokerMirrorActions(broker);

    const prices = await marketDataGateway.getPrices();
    const marketRows = prices.data || [];

    const marketLookup = Object.fromEntries(
      marketRows.map((item) => [
        String(item.symbol || "").trim().toUpperCase(),
        item
      ])
    );

    const valuedHoldings = holdings.map((h) => {
      const symbol = String(h.symbol || "").trim().toUpperCase();
      const market = marketLookup[symbol] || {};
      const price = Number(market.price || market.lastPrice || 0);
      const quantity = Number(h.quantity || 0);

      return {
        symbol,
        quantity,
        price,
        marketValue: quantity * price
      };
    });

    const totalValue = valuedHoldings.reduce(
      (sum, item) => sum + Number(item.marketValue || 0),
      0
    );

    const largest = [...valuedHoldings].sort(
      (a, b) => Number(b.marketValue || 0) - Number(a.marketValue || 0)
    )[0];

    const concentrationBefore =
      totalValue > 0 && largest
        ? Number(((largest.marketValue / totalValue) * 100).toFixed(2))
        : 0;

    const reducedValue = actions
      .filter((x) => x.action === "REDUCED")
      .reduce((sum, x) => {
        const symbol = String(x.symbol || "").trim().toUpperCase();
        const market = marketLookup[symbol] || {};
        const price = Number(market.price || market.lastPrice || 0);

        return sum + Number(x.quantity || 0) * price;
      }, 0);

    const concentrationAfter =
      totalValue > 0
        ? Math.max(
            concentrationBefore - (reducedValue / totalValue) * 100,
            0
          )
        : 0;

    const score = Math.max(100 - concentrationAfter, 0);

    res.json({
      ok: true,
      broker,
      method: "MARKET_VALUE",
      concentrationBefore,
      concentrationAfter: Number(concentrationAfter.toFixed(2)),
      improvement: Number(
        (concentrationBefore - concentrationAfter).toFixed(2)
      ),
      score: Number(score.toFixed(1)),
      actionsTaken: actions.length,
      reducedValue: Number(reducedValue.toFixed(2)),
      rating:
        score > 80
          ? "GOOD"
          : score > 60
          ? "MODERATE"
          : "HIGH_RISK"
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;