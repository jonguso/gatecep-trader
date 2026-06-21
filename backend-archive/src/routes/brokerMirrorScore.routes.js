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

    const actions = getBrokerMirrorActions(
      broker,
      clientNumber,
      cdsNumber
    );

    const prices = await marketDataGateway.getPrices();

    const marketLookup = Object.fromEntries(
      (prices.data || []).map((item) => [
        normalizeNseSymbol(item.symbol),
        item
      ])
    );

    const valuedHoldings = holdings.map((h) => {
      const symbol = normalizeNseSymbol(h.symbol);
      const market = marketLookup[symbol] || {};
      const quantity = cleanNumber(h.quantity);

      const price = cleanNumber(
        h.marketPrice ||
        h.price ||
        market.price ||
        market.lastPrice
      );

      const marketValue = cleanNumber(
        h.marketValue ||
        h.value ||
        quantity * price
      );

      const averagePrice = cleanNumber(h.averagePrice);

      const profitLoss = cleanNumber(
        h.profitLoss ||
        (
          averagePrice > 0
            ? marketValue - quantity * averagePrice
            : 0
        )
      );

      const costValue = quantity * averagePrice;

      const profitLossPct = cleanNumber(
        h.profitLossPct ||
        (
          costValue > 0
            ? (profitLoss / costValue) * 100
            : 0
        )
      );

      return {
        broker,
        clientNumber: h.clientNumber || clientNumber,
        cdsNumber: h.cdsNumber || cdsNumber,
        symbol,
        name: h.name || market.name || "",
        sector: market.sector || h.sector || "Unknown",
        quantity,
        price,
        averagePrice,
        marketValue,
        profitLoss,
        profitLossPct,
        weight: 0
      };
    });

    const totalValue = valuedHoldings.reduce(
      (sum, item) => sum + Number(item.marketValue || 0),
      0
    );

    valuedHoldings.forEach((item) => {
      item.weight =
        totalValue > 0
          ? Number(((item.marketValue / totalValue) * 100).toFixed(2))
          : 0;
    });

    const cashRows = filterByClient(
      getBrokerMirror(broker, "cash"),
      clientNumber,
      cdsNumber
    );

    let runningBalance = 0;

    cashRows.forEach((row) => {
      const debit = cleanNumber(row.debit);
      const credit = cleanNumber(row.credit);
      const explicitBalance = cleanNumber(row.balance);

      if (explicitBalance !== 0) {
        runningBalance = explicitBalance;
      } else {
        runningBalance = runningBalance + credit - debit;
      }
    });

    const ledgerBalance = Number(runningBalance.toFixed(2));
    const netWorth = totalValue + ledgerBalance;

    const cashRatio =
      netWorth > 0
        ? Number(((ledgerBalance / netWorth) * 100).toFixed(2))
        : 0;

    const largestHolding =
      [...valuedHoldings].sort(
        (a, b) => Number(b.weight || 0) - Number(a.weight || 0)
      )[0] || null;

    const sectorMap = {};

    valuedHoldings.forEach((item) => {
      const sector = item.sector || "Unknown";

      sectorMap[sector] =
        Number(sectorMap[sector] || 0) +
        Number(item.marketValue || 0);
    });

    const sectorExposure = Object.entries(sectorMap)
      .map(([sector, value]) => ({
        sector,
        value: Number(value.toFixed(2)),
        weight:
          totalValue > 0
            ? Number(((value / totalValue) * 100).toFixed(2))
            : 0
      }))
      .sort((a, b) => b.weight - a.weight);

    const largestSector = sectorExposure[0] || null;

    const negativePositions = valuedHoldings.filter(
      (item) => Number(item.profitLossPct || 0) < 0
    );

    const totalProfitLoss = valuedHoldings.reduce(
      (sum, item) => sum + Number(item.profitLoss || 0),
      0
    );

    const investedCost = valuedHoldings.reduce(
      (sum, item) =>
        sum +
        Number(item.averagePrice || 0) *
          Number(item.quantity || 0),
      0
    );

    const totalProfitLossPct =
      investedCost > 0
        ? Number(((totalProfitLoss / investedCost) * 100).toFixed(2))
        : 0;

    const sectorCount =
      new Set(valuedHoldings.map((item) => item.sector)).size;

    const reducedValue = actions
      .filter((x) => x.action === "REDUCED")
      .reduce((sum, x) => {
        const symbol = normalizeNseSymbol(x.symbol);
        const holding = valuedHoldings.find((h) => h.symbol === symbol);
        const fallbackMarket = marketLookup[symbol] || {};

        const price = Number(
          holding?.price ||
          fallbackMarket.price ||
          fallbackMarket.lastPrice ||
          0
        );

        return sum + Number(x.quantity || 0) * price;
      }, 0);

    const concentrationBefore = largestHolding?.weight || 0;

    const concentrationAfter =
      totalValue > 0
        ? Math.max(
            concentrationBefore - (reducedValue / totalValue) * 100,
            0
          )
        : 0;

    let score = 100;

    score -= Number(concentrationAfter || 0);

    if (largestSector?.weight > 40) {
      score -= 10;
    } else if (largestSector?.weight > 30) {
      score -= 5;
    }

    const negativePct =
      valuedHoldings.length > 0
        ? (negativePositions.length / valuedHoldings.length) * 100
        : 0;

    score -= Number((negativePct * 0.4).toFixed(2));

    if (sectorCount < 3) {
      score -= 15;
    } else if (sectorCount < 5) {
      score -= 8;
    }

    let cashAdvice = "Cash level is acceptable.";

    if (cashRatio > 25) {
      score -= 10;
      cashAdvice =
        "You are holding a high cash balance. Consider investing part of the available funds based on your goal.";
    } else if (cashRatio > 10) {
      score -= 4;
      cashAdvice =
        "You have moderate cash available. Coach G can help deploy it gradually.";
    }

    score = Math.max(0, Math.min(100, Number(score.toFixed(1))));

    const rating =
      score >= 80
        ? "GOOD"
        : score >= 60
        ? "MODERATE"
        : "HIGH_RISK";

    res.json({
      ok: true,
      broker,
      clientNumber,
      cdsNumber,
      method: valuationRows.length > 0 ? "BROKER_VALUATION" : "MARKET_ESTIMATE",
      totalValue: Number(totalValue.toFixed(2)),
      netWorth: Number(netWorth.toFixed(2)),
      cashSummary: {
        ledgerBalance,
        cashRatio,
        cashAdvice
      },
      portfolioSummary: {
        portfolioValue: Number(totalValue.toFixed(2)),
        availableCash: ledgerBalance,
        netWorth: Number(netWorth.toFixed(2)),
        profitLoss: Number(totalProfitLoss.toFixed(2)),
        profitLossPct: totalProfitLossPct
      },
      concentrationBefore,
      concentrationAfter: Number(concentrationAfter.toFixed(2)),
      improvement: Number((concentrationBefore - concentrationAfter).toFixed(2)),
      score,
      rating,
      actionsTaken: actions.length,
      reducedValue: Number(reducedValue.toFixed(2)),
      largestHolding,
      largestSector,
      sectorCount,
      negativePositions: negativePositions.length,
      sectorExposure,
      holdings: valuedHoldings
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;