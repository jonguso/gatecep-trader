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
  const targetClient = String(clientNumber || "").trim();
  const targetCds = String(cdsNumber || "").trim();

  if (!targetClient && !targetCds) return rows;

  return rows.filter((row) => {
    const rowClient = String(row.clientNumber || "").trim();
    const rowCds = String(row.cdsNumber || "").trim();

    const clientOk =
      !targetClient ||
      !rowClient ||
      rowClient === targetClient;

    const cdsOk =
      !targetCds ||
      !rowCds ||
      rowCds === targetCds;

    return clientOk && cdsOk;
  });
}

router.get("/:broker", async (req, res) => {
  try {
    const broker = normalizeBroker(req.params.broker);

    const clientNumber = String(req.query.clientNumber || "").trim();
    const cdsNumber = String(req.query.cdsNumber || "").trim();

    const amount = cleanNumber(req.query.amount);
    const goal = String(req.query.goal || "balanced_growth").toLowerCase();
    const risk = String(req.query.risk || "balanced").toLowerCase();

    if (amount <= 0) {
      return res.status(400).json({
        ok: false,
        error: "amount required"
      });
    }

    const riskCaps = {
      conservative: {
        maxSectorWeight: 30,
        maxOwnedSectorWeight: 25
      },
      balanced: {
        maxSectorWeight: 40,
        maxOwnedSectorWeight: 30
      },
      aggressive: {
        maxSectorWeight: 50,
        maxOwnedSectorWeight: 40
      }
    };

    const selectedRisk =
      riskCaps[risk] ||
      riskCaps.balanced;

    const goalProfiles = {
      wealth_growth: {
        label: "Wealth Growth",
        preferred: [
          "Banking",
          "ETF",
          "Investment",
          "Investment Services"
        ],
        strategy:
          "Prioritize growth sectors and broad market exposure."
      },
      dividend: {
        label: "Dividend Income",
        preferred: [
          "Banking",
          "Manufacturing and Allied",
          "Manufacturing",
          "Telecommunication"
        ],
        strategy:
          "Prioritize mature income-generating sectors."
      },
      balanced_growth: {
        label: "Balanced Growth",
        preferred: [
          "Banking",
          "ETF",
          "REIT",
          "Insurance"
        ],
        strategy:
          "Balance growth with diversification and lower concentration risk."
      },
      preservation: {
        label: "Capital Preservation",
        preferred: [
          "ETF",
          "REIT",
          "Insurance"
        ],
        strategy:
          "Prioritize lower volatility and diversified exposure."
      },
      custom: {
        label: "Custom Goal",
        preferred: [],
        strategy:
          "Use portfolio-aware diversification without a preset sector preference."
      }
    };

    const selectedGoal =
      goalProfiles[goal] ||
      goalProfiles.balanced_growth;

    const valuationRows = filterByClient(
      getBrokerMirror(broker, "valuation"),
      clientNumber,
      cdsNumber
    );

    const holdingRows = filterByClient(
      getBrokerMirror(broker, "holdings"),
      clientNumber,
      cdsNumber
    );

    const holdings =
      valuationRows.length > 0
        ? valuationRows
        : holdingRows;

    const prices = await marketDataGateway.getPrices();
    const market = prices.data || [];

    const marketLookup = Object.fromEntries(
      market.map((item) => [
        normalizeNseSymbol(item.symbol),
        item
      ])
    );

    const portfolioSymbols = new Set();
    const sectorValues = {};

    const portfolioValueRows = holdings.map((holding) => {
      const symbol = normalizeNseSymbol(holding.symbol);
      portfolioSymbols.add(symbol);

      const marketRow = marketLookup[symbol] || {};

      const quantity = cleanNumber(holding.quantity);

      const price = cleanNumber(
        holding.marketPrice ||
          holding.price ||
          marketRow.price ||
          marketRow.lastPrice
      );

      const value = cleanNumber(
        holding.marketValue ||
          quantity * price
      );

      const sector =
        holding.sector ||
        marketRow.sector ||
        "Unknown";

      sectorValues[sector] =
        Number(sectorValues[sector] || 0) +
        value;

      return {
        broker,
        clientNumber: holding.clientNumber || clientNumber,
        cdsNumber: holding.cdsNumber || cdsNumber,
        symbol,
        sector,
        quantity,
        price,
        value
      };
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

    const preferredSectors =
      selectedGoal.preferred || [];

    const candidates = market
      .filter((item) => cleanNumber(item.changePct) > 1)
      .filter((item) => {
        const symbol = normalizeNseSymbol(item.symbol);
        const sector = item.sector || "Unknown";

        const alreadyOwned =
          portfolioSymbols.has(symbol);

        const sectorWeight =
          Number(sectorWeights[sector] || 0);

        if (
          alreadyOwned &&
          sectorWeight >
            selectedRisk.maxOwnedSectorWeight
        ) {
          return false;
        }

        if (
          sectorWeight >
          selectedRisk.maxSectorWeight
        ) {
          return false;
        }

        return true;
      })
      .filter((item) => {
        if (preferredSectors.length === 0) {
          return true;
        }

        return preferredSectors.includes(
          item.sector || "Unknown"
        );
      })
      .sort(
        (a, b) =>
          cleanNumber(b.changePct) -
          cleanNumber(a.changePct)
      )
      .slice(0, 10);

    const allocation =
      candidates.length > 0
        ? amount / candidates.length
        : 0;

    const recommendations =
      candidates.map((item) => {
        const symbol =
          normalizeNseSymbol(item.symbol);

        const sector =
          item.sector || "Unknown";

        const price =
          cleanNumber(
            item.price ||
              item.lastPrice
          );

        const alreadyOwned =
          portfolioSymbols.has(symbol);

        return {
          action: "BUY_CONSIDER",
          symbol,
          name: item.name,
          sector,
          price,
          changePct:
            cleanNumber(item.changePct),
          alreadyOwned,
          suggestedAmount:
            Number(
              allocation.toFixed(2)
            ),
          estimatedShares:
            price > 0
              ? Math.floor(
                  allocation / price
                )
              : 0,
          reason:
            alreadyOwned
              ? "Existing position is still within acceptable concentration."
              : sectorWeights[sector]
              ? "Improves sector balance while staying within risk limits."
              : "Adds new sector exposure aligned to the selected goal."
        };
      })
      .filter(
        (item) =>
          item.estimatedShares > 0
      );

    const projectedSectorValues = {
      ...sectorValues
    };

    recommendations.forEach((rec) => {
      const sector =
        rec.sector || "Unknown";

      projectedSectorValues[sector] =
        Number(projectedSectorValues[sector] || 0) +
        Number(rec.suggestedAmount || 0);
    });

    const projectedTotalValue =
      totalPortfolioValue +
      amount;

    const targetPlan =
      Object.entries(projectedSectorValues)
        .map(([sector, value]) => ({
          sector,
          currentWeight:
            Number(
              (
                (
                  Number(sectorValues[sector] || 0) /
                  Math.max(totalPortfolioValue, 1)
                ) *
                100
              ).toFixed(2)
            ),
          projectedWeight:
            Number(
              (
                (
                  Number(value || 0) /
                  Math.max(projectedTotalValue, 1)
                ) *
                100
              ).toFixed(2)
            )
        }))
        .sort(
          (a, b) =>
            b.projectedWeight -
            a.projectedWeight
        );

    const riskDirection =
      targetPlan.some(
        (item) =>
          item.projectedWeight >
          selectedRisk.maxSectorWeight
      )
        ? "STILL_HIGH"
        : targetPlan.some(
            (item) =>
              item.projectedWeight >
              selectedRisk.maxOwnedSectorWeight
          )
        ? "IMPROVING"
        : "BALANCED";

    const blockedInvestments = market
      .filter((item) => {
        const symbol = normalizeNseSymbol(item.symbol);
        const sector = item.sector || "Unknown";

        const alreadyOwned =
          portfolioSymbols.has(symbol);

        const sectorWeight =
          Number(sectorWeights[sector] || 0);

        if (
          alreadyOwned &&
          sectorWeight >
            selectedRisk.maxOwnedSectorWeight
        ) {
          return true;
        }

        if (
          sectorWeight >
          selectedRisk.maxSectorWeight
        ) {
          return true;
        }

        return false;
      })
      .slice(0, 10)
      .map((item) => {
        const symbol =
          normalizeNseSymbol(item.symbol);

        const sector =
          item.sector || "Unknown";

        return {
          symbol,
          sector,
          reason:
            portfolioSymbols.has(symbol)
              ? `Existing sector concentration too high (${sectorWeights[sector] || 0}%).`
              : `Sector exposure already high (${sectorWeights[sector] || 0}%).`
        };
      });

    const diversificationScore =
      Object.keys(sectorWeights).length >= 5
        ? "GOOD"
        : Object.keys(sectorWeights).length >= 3
        ? "MODERATE"
        : "LOW";

    res.json({
      ok: true,
      broker,
      clientNumber,
      cdsNumber,
      amount,
      goal,
      risk,
      goalProfile: selectedGoal,
      riskCaps: selectedRisk,
      mode: "ADVISORY_ONLY",
      recommendation:
        holdings.length === 0
          ? "Starter portfolio recommendation"
          : "Recommended allocation of NEW capital",
      recommendations,
      currentSectorExposure: sectorWeights,
      targetPlan,
      projectedPortfolioValue:
        Number(
          projectedTotalValue.toFixed(2)
        ),
      riskDirection,
      blockedInvestments,
      portfolioSummary: {
        existingPositions:
          holdings.length,
        existingSectors:
          Object.keys(sectorWeights).length,
        diversificationScore
      },
      coachGNotes: [
        selectedGoal.strategy,
        "Gatecep is advisory only at this stage and will not execute trades.",
        "Future broker integration can route approved trades after customer consent."
      ]
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;