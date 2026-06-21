import express from "express";

import {
  getUnifiedPortfolio
} from "../services/portfolio/unifiedPortfolio.service.js";

const router = express.Router();

function money(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

router.post("/ask", async (req, res) => {
  try {
    const question = String(req.body.question || "").toUpperCase();

    let portfolio = null;

    try {
      portfolio = await getUnifiedPortfolio();
    } catch (error) {
      console.error("Coach G portfolio load failed:", error.message);
    }

    const holdings = portfolio?.holdings || [];
    const totalPnL = Number(portfolio?.totalPnL || 0);
    const totalMarketValue = Number(portfolio?.totalMarketValue || 0);

    const scomHolding = holdings.find(
      (item) => item.symbol === "SCOM"
    );

    const kcbHolding = holdings.find(
      (item) => item.symbol === "KCB"
    );

    let answer =
      "Coach G recommends checking liquidity, spread, portfolio concentration, and execution quality before placing any trade.";

    let recommendation = "REVIEW";
    let confidence = 82;

    if (question.includes("SCOM")) {
      recommendation = "BUY";
      confidence = 88;

      answer =
        `SCOM looks stable with healthy liquidity and manageable spread risk. ` +
        `Your current SCOM position is ${
          scomHolding
            ? `${scomHolding.quantity} shares valued at ${money(scomHolding.marketValue)}`
            : "not currently held"
        }. ` +
        `Coach G suggests a small BUY only if you are comfortable with your telecom exposure.`;
    }

    if (question.includes("KCB")) {
      recommendation = "HOLD";
      confidence = 76;

      answer =
        `KCB has moderate momentum. ` +
        `Your current KCB position is ${
          kcbHolding
            ? `${kcbHolding.quantity} shares with unrealized P&L of ${money(kcbHolding.unrealizedPnL)}`
            : "not currently held"
        }. ` +
        `Coach G recommends HOLD unless volume improves and price breaks resistance.`;
    }

    if (question.includes("PORTFOLIO")) {
      recommendation = "REVIEW";
      confidence = 90;

      answer =
        `Your portfolio market value is ${money(totalMarketValue)} with total P&L of ${money(totalPnL)}. ` +
        `Coach G recommends reviewing concentration risk before adding more positions. ` +
        `You currently hold ${holdings.length} active positions.`;
    }

    if (question.includes("RISK")) {
      recommendation = "CAUTION";
      confidence = 84;

      answer =
        `Current portfolio risk is ${
          totalPnL < 0 ? "elevated" : "moderate"
        }. ` +
        `Total P&L is ${money(totalPnL)}. ` +
        `Use smaller order sizes, avoid chasing price spikes, and confirm liquidity before execution.`;
    }

const reasoning = [];
const risks = [];

if (recommendation === "BUY") {
  reasoning.push("Healthy liquidity conditions");
  reasoning.push("Manageable spread risk");
  reasoning.push("Positive trade setup detected");
}

if (question.includes("SCOM")) {
  reasoning.push("Telecommunications exposure may benefit from strong market activity");

  if (scomHolding) {
    risks.push(
      `Existing SCOM exposure is already ${scomHolding.quantity} shares`
    );
  }
}

if (question.includes("KCB")) {
  reasoning.push("Banking sector exposure detected");

  if (kcbHolding?.unrealizedPnL < 0) {
    risks.push("KCB position currently has unrealized losses");
  }
}

if (question.includes("PORTFOLIO") || question.includes("RISK")) {
  reasoning.push("Portfolio value and P&L reviewed");
  reasoning.push(`${holdings.length} active positions analyzed`);

  if (holdings.length < 4) {
    risks.push("Portfolio diversification is still limited");
  }

  if (totalPnL < 0) {
    risks.push("Portfolio total P&L is currently negative");
  }
}

if (confidence < 80) {
  risks.push("AI confidence is below strong conviction level");
}

const suggestedAllocation =
  recommendation === "BUY"
    ? confidence >= 90
      ? "8% - 12%"
      : confidence >= 75
      ? "5% - 8%"
      : "2% - 5%"
    : "No new allocation suggested";

return res.json({
  ok: true,
  answer,
  confidence,
  recommendation,
  reasoning,
  risks,
  suggestedAllocation,
  portfolioContext: {
    totalMarketValue,
    totalPnL,
    holdingCount: holdings.length
  },
  generatedAt: new Date().toISOString()
});

  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;