import express from "express";

import {
  saveBrokerAccountSummary,
  getBrokerAccountSummary
} from "../repositories/brokerAccountSummary.repository.js";

const router = express.Router();

function normalizeBroker(value) {
  const broker = String(value || "AIB-AXYS")
    .trim()
    .toUpperCase();

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

  return Number.isFinite(num)
    ? num
    : 0;
}

function buildSummaryResponse(summary) {

  const portfolioValue =
    cleanNumber(summary.portfolioValue);

  const ledgerBalance =
    cleanNumber(summary.ledgerBalance);

  const unsettledPurchaseValue =
    cleanNumber(summary.unsettledPurchaseValue);

  const unsettledSaleValue =
    cleanNumber(summary.unsettledSaleValue);

  const netWorth =
    portfolioValue +
    ledgerBalance +
    unsettledPurchaseValue +
    unsettledSaleValue;

  const availableFunds =
    ledgerBalance;

  const cashRatio =
    netWorth > 0
      ? Number(
          (
            availableFunds /
            netWorth *
            100
          ).toFixed(2)
        )
      : 0;

  return {

    ...summary,

    portfolioValue,

    ledgerBalance,

    availableFunds,

    unsettledPurchaseValue,

    unsettledSaleValue,

    netWorth:
      Number(
        netWorth.toFixed(2)
      ),

    cashRatio,

    coachGStatus:

      cashRatio > 25

        ? "HIGH_CASH"

        : cashRatio < 5

        ? "LOW_CASH"

        : "BALANCED"

  };

}

router.post("/:broker", (req, res) => {

  try {

    const broker =
      normalizeBroker(
        req.params.broker
      );

    const clientNumber =
      String(
        req.body.clientNumber || ""
      ).trim();

    const cdsNumber =
      String(
        req.body.cdsNumber || ""
      ).trim();

    const summary =
      saveBrokerAccountSummary(
        broker,
        {

          ...req.body,

          broker,

          clientNumber,

          cdsNumber

        }
      );

    res.json({

      ok:true,

      broker,

      clientNumber,

      cdsNumber,

      summary:
        buildSummaryResponse(
          summary
        )

    });

  } catch(error){

    res.status(500).json({

      ok:false,

      error:error.message

    });

  }

});

router.get("/:broker", (req, res) => {

  try {

    const broker =
      normalizeBroker(
        req.params.broker
      );

    const clientNumber =
      String(
        req.query.clientNumber || ""
      ).trim();

    const cdsNumber =
      String(
        req.query.cdsNumber || ""
      ).trim();

    const summary =
      getBrokerAccountSummary(
        broker,
        clientNumber,
        cdsNumber
      );

    res.json({

      ok:true,

      broker,

      clientNumber,

      cdsNumber,

      summary:
        buildSummaryResponse(
          summary
        )

    });

  } catch(error){

    res.status(500).json({

      ok:false,

      error:error.message

    });

  }

});

export default router;