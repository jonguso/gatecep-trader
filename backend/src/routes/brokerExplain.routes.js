import express from "express";

import {
  getBrokerMirror
} from "../repositories/brokerMirror.repository.js";

import {
  marketDataGateway
} from "../services/marketData/MarketDataGateway.js";

import {
  normalizeNseSymbol
} from "../data/nseSecurityMaster.js";

const router = express.Router();

router.get("/:broker/:symbol", async (req, res) => {
  try {

    const broker =
      String(req.params.broker || "AIB")
      .toUpperCase();

    const symbol =
      normalizeNseSymbol(
        req.params.symbol
      );

    /*
      Prefer valuation data
      fallback to holdings
    */

    const valuationRows =
      getBrokerMirror(
        broker,
        "valuation"
      );

    const holdingsRows =
      getBrokerMirror(
        broker,
        "holdings"
      );

    const sourceRows =
      valuationRows.length > 0
        ? valuationRows
        : holdingsRows;

    const holding =
      sourceRows.find(
        item =>
          normalizeNseSymbol(
            item.symbol
          ) === symbol
      );

    if (!holding) {

      return res
      .status(404)
      .json({

        ok:false,

        error:
          "Holding not found"

      });

    }

    const prices =
      await marketDataGateway
      .getPrices();

    const market =
      (prices.data || [])
      .find(
        item =>
          normalizeNseSymbol(
            item.symbol
          ) === symbol
      ) || {};

    const quantity =
      Number(
        holding.quantity || 0
      );

    const averagePrice =
      Number(
        holding.averagePrice ||
        0
      );

    const price =
      Number(
        holding.marketPrice ||
        market.price ||
        market.lastPrice ||
        0
      );

    const marketValue =
      Number(
        holding.marketValue ||
        quantity * price
      );

    const costValue =
      quantity *
      averagePrice;

    const profitLoss =
      Number(
        holding.profitLoss ||
        (
          costValue > 0
            ? marketValue - costValue
            : 0
        )
      );

    const profitLossPct =
      Number(
        holding.profitLossPct ||
        (
          costValue > 0
            ? (
                profitLoss /
                costValue
              ) * 100
            : 0
        )
      );

    const changePct =
      Number(
        market.changePct || 0
      );

    let recommendation =
      "Maintain current monitoring.";

    if (changePct < -3) {

      recommendation =
        "Momentum weakening. Coach G recommends reviewing concentration and thesis.";

    } else if (
      changePct > 3
    ) {

      recommendation =
        "Momentum improving. Continue monitoring position sizing.";

    }

    res.json({

      ok:true,

      broker,

      symbol,

      source:

        valuationRows.length > 0
          ? "VALUATION"
          : "HOLDINGS",

      name:

        holding.name ||
        market.name ||
        "",

      sector:

        market.sector ||
        holding.sector ||
        "Unknown",

      quantity,

      averagePrice,

      marketPrice: price,

      marketValue:
        Number(
          marketValue.toFixed(2)
        ),

      profitLoss:
        Number(
          profitLoss.toFixed(2)
        ),

      profitLossPct:
        Number(
          profitLossPct.toFixed(2)
        ),

      changePct,

      explanation:

`${symbol} currently represents KES ${marketValue.toFixed(2)} of your portfolio. Position return is ${profitLossPct.toFixed(2)}%. Market momentum is ${changePct}% and Coach G assessment is: ${recommendation}`

    });

  } catch(error){

    res.status(500).json({

      ok:false,

      error:error.message

    });

  }

});

export default router;