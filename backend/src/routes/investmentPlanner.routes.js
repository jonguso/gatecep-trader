import express from "express";

import { getBrokerMirror } from "../repositories/brokerMirror.repository.js";

import { marketDataGateway } from "../services/marketData/MarketDataGateway.js";

const router = express.Router();

router.get("/:broker", async (req, res) => {
  try {
    const broker = String(req.params.broker || "AIB").toUpperCase();
    const amount = Number(req.query.amount || 0);

    if (amount <= 0) {
      return res.status(400).json({
        ok: false,
        error: "amount required"
      });
    }

    const holdings = getBrokerMirror(broker, "holdings");

    const prices = await marketDataGateway.getPrices();
    const market = prices.data || [];

    const marketLookup = Object.fromEntries(
      market.map((item) => [
        String(item.symbol || "").trim().toUpperCase(),
        item
      ])
    );

    const portfolioSymbols = new Set();
    const sectorValues = {};

    const portfolioValueRows = holdings.map((holding) => {
      const symbol = String(holding.symbol || "").trim().toUpperCase();
      portfolioSymbols.add(symbol);

      const marketRow = marketLookup[symbol] || {};

      const quantity = Number(holding.quantity || 0);
      const price = Number(marketRow.price || marketRow.lastPrice || 0);
      const value = quantity * price;
      const sector = marketRow.sector || "Unknown";

      sectorValues[sector] = Number(sectorValues[sector] || 0) + value;

      return { symbol, sector, value };
    });

    const totalPortfolioValue = portfolioValueRows.reduce(
      (sum, row) => sum + Number(row.value || 0),
      0
    );

    const sectorWeights = {};

    Object.entries(sectorValues).forEach(([sector, value]) => {
      sectorWeights[sector] =
        totalPortfolioValue > 0
          ? Number(((value / totalPortfolioValue) * 100).toFixed(2))
          : 0;
    });

    const goal = String(
  req.query.goal || "balanced_growth"
).toLowerCase();

const goalProfiles = {
  wealth_growth: {
    label: "Wealth Growth",
    preferred: ["Banking", "ETF", "Investment", "Investment Services"],
    strategy: "Prioritize growth sectors and broad market exposure."
  },
  dividend: {
    label: "Dividend Income",
    preferred: ["Banking", "Manufacturing and Allied", "Telecommunication"],
    strategy: "Prioritize mature income-generating sectors."
  },
  balanced_growth: {
    label: "Balanced Growth",
    preferred: ["Banking", "ETF", "REIT", "Insurance"],
    strategy: "Balance growth with diversification and lower concentration risk."
  },
  preservation: {
    label: "Capital Preservation",
    preferred: ["ETF", "REIT", "Insurance"],
    strategy: "Prioritize lower volatility and diversified exposure."
  },
  custom: {
    label: "Custom Goal",
    preferred: [],
    strategy: "Use portfolio-aware diversification without a preset sector preference."
  }
};

const selectedGoal =
  goalProfiles[goal] ||
  goalProfiles.balanced_growth;

    const candidates = market
      .filter((item) => Number(item.changePct || 0) > 1)
      .filter((item) => {
        const symbol = String(item.symbol || "").trim().toUpperCase();
        const sector = item.sector || "Unknown";
        const alreadyOwned = portfolioSymbols.has(symbol);
        const sectorWeight = Number(sectorWeights[sector] || 0);
       
        if (alreadyOwned && sectorWeight > 30) return false;
        if (sectorWeight > 40) return false;

        return true;
      })
        .filter((item) => {
  const preferred = selectedGoal.preferred || [];

  if (preferred.length === 0) {
    return true;
  }

  return preferred.includes(item.sector || "Unknown");
})
       
      .sort((a, b) => Number(b.changePct || 0) - Number(a.changePct || 0))
      .slice(0, 10);

    const allocation =
      candidates.length > 0
        ? amount / candidates.length
        : 0;

    const recommendations = candidates.map((item) => {
      const symbol = String(item.symbol || "").trim().toUpperCase();
      const sector = item.sector || "Unknown";
      const alreadyOwned = portfolioSymbols.has(symbol);

      return {
        symbol: item.symbol,
        name: item.name,
        sector,
        price: Number(item.price || item.lastPrice || 0),
        alreadyOwned,
        suggestedAmount: Number(allocation.toFixed(2)),
        estimatedShares: Math.floor(
          allocation / Number(item.price || item.lastPrice || 1)
        ),
        reason: alreadyOwned
          ? "Existing position but still within acceptable concentration."
          : sectorWeights[sector]
          ? "Improves sector balance."
          : "Adds new sector exposure."
      };
    });

    const projectedSectorValues = {
      ...sectorValues
    };

    recommendations.forEach((rec) => {
      const sector = rec.sector || "Unknown";

      projectedSectorValues[sector] =
        Number(projectedSectorValues[sector] || 0) +
        Number(rec.suggestedAmount || 0);
    });

    const projectedTotalValue =
      totalPortfolioValue + amount;

    const targetPlan = Object.entries(projectedSectorValues)
      .map(([sector, value]) => ({
        sector,
        currentWeight: Number(
          (
            (Number(sectorValues[sector] || 0) /
              Math.max(totalPortfolioValue, 1)) *
            100
          ).toFixed(2)
        ),
        projectedWeight: Number(
          (
            (Number(value || 0) /
              Math.max(projectedTotalValue, 1)) *
            100
          ).toFixed(2)
        )
      }))
      .sort((a, b) => b.projectedWeight - a.projectedWeight);

    const riskDirection = targetPlan.some(
      (x) => x.projectedWeight > 40
    )
      ? "STILL_HIGH"
      : targetPlan.some((x) => x.projectedWeight > 30)
      ? "IMPROVING"
      : "BALANCED";

    const blockedInvestments = market
      .filter((item) => {
        const symbol = String(item.symbol || "").trim().toUpperCase();
        const sector = item.sector || "Unknown";
        const alreadyOwned = portfolioSymbols.has(symbol);
        const sectorWeight = Number(sectorWeights[sector] || 0);

        if (alreadyOwned && sectorWeight > 30) return true;
        if (sectorWeight > 40) return true;

        return false;
      })
      .slice(0, 10)
      .map((item) => {
        const sector = item.sector || "Unknown";

        return {
          symbol: item.symbol,
          sector,
          reason: portfolioSymbols.has(
            String(item.symbol || "").trim().toUpperCase()
          )
            ? `Existing sector concentration too high (${sectorWeights[sector] || 0}%)`
            : `Sector exposure already high (${sectorWeights[sector] || 0}%)`
        };
      });

    res.json({
      ok: true,
      broker,
      amount,
      goal,
      goalProfile: selectedGoal,
      mode: "ADVISORY_ONLY",
      recommendation:
        holdings.length === 0
          ? "Starter portfolio recommendation"
          : "Recommended allocation of NEW capital",
      recommendations,
      currentSectorExposure: sectorWeights,
      targetPlan,
      projectedPortfolioValue: Number(projectedTotalValue.toFixed(2)),
      riskDirection,
      blockedInvestments,
      portfolioSummary: {
        existingPositions: holdings.length,
        existingSectors: Object.keys(sectorWeights).length,
        diversificationScore:
          Object.keys(sectorWeights).length >= 5
            ? "GOOD"
            : Object.keys(sectorWeights).length >= 3
            ? "MODERATE"
            : "LOW"
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;