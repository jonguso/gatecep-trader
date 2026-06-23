import express from "express";

import {
  applySecurityMaster,
  normalizeNseSymbol
} from "../../data/nseSecurityMaster.js";

import {
  getBrokerMirror
} from "../../repositories/brokerMirror.repository.js";

import {
  marketDataGateway
} from "../../services/marketData/MarketDataGateway.js";

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
  if (!clientNumber && !cdsNumber) return rows;

  return rows.filter((row) => {
    const rowClient = String(row.clientNumber || "").trim();
    const rowCds = String(row.cdsNumber || "").trim();

    return (
      (!clientNumber || rowClient === clientNumber) &&
      (!cdsNumber || rowCds === cdsNumber)
    );
  });
}

function isUnknown(value) {
  const text = String(value || "").trim().toLowerCase();

  return !text || text === "unknown" || text === "n/a" || text === "na";
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

    const sourceRows =
      valuationRows.length > 0
        ? valuationRows
        : holdingRows;

    const source =
      valuationRows.length > 0
        ? "VALUATION"
        : "HOLDINGS";

    const pricesResult = await marketDataGateway.getPrices();

    const priceLookup = Object.fromEntries(
      (pricesResult.data || []).map((item) => [
        normalizeNseSymbol(item.symbol || item.code),
        item
      ])
    );

    const portfolio = sourceRows.map((holding) => {
      const masteredHolding = applySecurityMaster(holding);
      const symbol = normalizeNseSymbol(masteredHolding.symbol || holding.symbol);
      const market = priceLookup[symbol] || {};
      const masteredMarket = applySecurityMaster({
        ...market,
        symbol
      });

      const quantity = cleanNumber(masteredHolding.quantity);

      const price = cleanNumber(
        masteredHolding.marketPrice ||
          masteredHolding.price ||
          masteredMarket.price ||
          masteredMarket.lastPrice ||
          masteredMarket.currentPrice ||
          masteredMarket.marketPrice
      );

      const marketValue = cleanNumber(
        masteredHolding.marketValue ||
          masteredHolding.value ||
          quantity * price
      );

      const averagePrice = cleanNumber(
        masteredHolding.averagePrice ||
          masteredHolding.avgPrice ||
          masteredHolding.averageCost
      );

      const costValue = quantity * averagePrice;

      const profitLoss = cleanNumber(
        masteredHolding.profitLoss ||
          (
            costValue > 0
              ? marketValue - costValue
              : 0
          )
      );

      const profitLossPct = cleanNumber(
        masteredHolding.profitLossPct ||
          (
            costValue > 0
              ? (profitLoss / costValue) * 100
              : 0
          )
      );

      const finalMastered = applySecurityMaster({
        ...masteredMarket,
        ...masteredHolding,
        symbol
      });

      const name = isUnknown(finalMastered.name)
        ? symbol
        : finalMastered.name;

      const sector = isUnknown(finalMastered.sector)
        ? "Unknown"
        : finalMastered.sector;

      return {
        broker,
        clientNumber: masteredHolding.clientNumber || clientNumber,
        cdsNumber: masteredHolding.cdsNumber || cdsNumber,
        symbol: finalMastered.symbol || symbol,
        name,
        sector,
        quantity,
        averagePrice,
        price,
        marketValue,
        profitLoss,
        profitLossPct: Number(profitLossPct.toFixed(2)),
        changePct: cleanNumber(
          masteredHolding.changePct || masteredMarket.changePct
        ),
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
      clientNumber,
      cdsNumber,
      source,
      totalValue: Number(totalValue.toFixed(2)),
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