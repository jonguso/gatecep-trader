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

router.get("/insight/:broker", async (req, res) => {
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

    const source =
      valuationRows.length > 0
        ? "VALUATION"
        : "HOLDINGS";

    const pricesResult = await marketDataGateway.getPrices();

    const marketLookup = Object.fromEntries(
      (pricesResult.data || []).map((item) => [
        normalizeNseSymbol(item.symbol),
        {
          price: cleanNumber(item.price || item.lastPrice),
          sector: item.sector || "Unknown",
          name: item.name || "",
          changePct: cleanNumber(item.changePct)
        }
      ])
    );

    const valuedHoldings = holdings.map((holding) => {
      const symbol = normalizeNseSymbol(holding.symbol);
      const market = marketLookup[symbol] || {};

      const quantity = cleanNumber(holding.quantity);

      const price = cleanNumber(
        holding.marketPrice ||
          holding.price ||
          market.price
      );

      const marketValue = cleanNumber(
        holding.marketValue ||
          quantity * price
      );

      const averagePrice = cleanNumber(holding.averagePrice);

      const costValue = quantity * averagePrice;

      const profitLoss = cleanNumber(
        holding.profitLoss ||
          (
            costValue > 0
              ? marketValue - costValue
              : 0
          )
      );

      const profitLossPct = cleanNumber(
        holding.profitLossPct ||
          (
            costValue > 0
              ? (profitLoss / costValue) * 100
              : 0
          )
      );

      return {
        ...holding,
        broker,
        clientNumber: holding.clientNumber || clientNumber,
        cdsNumber: holding.cdsNumber || cdsNumber,
        symbol,
        name: holding.name || market.name || "",
        quantity,
        price,
        sector: holding.sector || market.sector || "Unknown",
        marketValue,
        averagePrice,
        profitLoss,
        profitLossPct: Number(profitLossPct.toFixed(2)),
        changePct: cleanNumber(holding.changePct || market.changePct)
      };
    });

    const totalValue = valuedHoldings.reduce(
      (sum, item) => sum + Number(item.marketValue || 0),
      0
    );

    const weightedHoldings = valuedHoldings.map((item) => ({
      ...item,
      weight:
        totalValue > 0
          ? Number(((item.marketValue / totalValue) * 100).toFixed(2))
          : 0
    }));

    const sectorMap = {};

    for (const item of weightedHoldings) {
      const sector = item.sector || "Unknown";

      if (!sectorMap[sector]) {
        sectorMap[sector] = {
          sector,
          marketValue: 0,
          weight: 0,
          profitLoss: 0,
          holdings: []
        };
      }

      sectorMap[sector].marketValue += Number(item.marketValue || 0);
      sectorMap[sector].profitLoss += Number(item.profitLoss || 0);
      sectorMap[sector].holdings.push(item.symbol);
    }

    const sectorExposure = Object.values(sectorMap)
      .map((sector) => ({
        ...sector,
        marketValue: Number(sector.marketValue.toFixed(2)),
        profitLoss: Number(sector.profitLoss.toFixed(2)),
        weight:
          totalValue > 0
            ? Number(((sector.marketValue / totalValue) * 100).toFixed(2))
            : 0
      }))
      .sort((a, b) => b.weight - a.weight);

    const topHolding =
      [...weightedHoldings].sort(
        (a, b) => Number(b.weight || 0) - Number(a.weight || 0)
      )[0] || null;

    const topExposurePct = Number(topHolding?.weight || 0);

    const holdingRiskLevel =
      topExposurePct >= 40
        ? "HIGH"
        : topExposurePct >= 25
        ? "MEDIUM"
        : "LOW";

    const topSector =
      sectorExposure.length > 0
        ? sectorExposure[0]
        : null;

    const sectorRiskLevel =
      Number(topSector?.weight || 0) >= 40
        ? "HIGH"
        : Number(topSector?.weight || 0) >= 30
        ? "MEDIUM"
        : "LOW";

    const combinedRiskLevel =
      holdingRiskLevel === "HIGH" || sectorRiskLevel === "HIGH"
        ? "HIGH"
        : holdingRiskLevel === "MEDIUM" || sectorRiskLevel === "MEDIUM"
        ? "MEDIUM"
        : "LOW";

    const recommendation =
      combinedRiskLevel === "HIGH"
        ? `Your largest position is ${topHolding?.symbol || "N/A"} at ${topExposurePct}% of portfolio value. Your largest sector is ${topSector?.sector || "N/A"} at ${topSector?.weight || 0}%. Risk level is HIGH. Consider reducing concentration or adding exposure to other sectors.`
        : combinedRiskLevel === "MEDIUM"
        ? `Your portfolio has moderate concentration. ${topHolding?.symbol || "N/A"} is ${topExposurePct}% and ${topSector?.sector || "N/A"} is ${topSector?.weight || 0}%. Monitor before adding more.`
        : "Your portfolio appears reasonably diversified by holding and sector exposure.";

    res.json({
      ok: true,
      broker,
      clientNumber,
      cdsNumber,
      source,
      totalValue: Number(totalValue.toFixed(2)),
      holdingsCount: holdings.length,
      topHolding,
      topExposurePct,
      holdingRiskLevel,
      topSector,
      sectorRiskLevel,
      riskLevel: combinedRiskLevel,
      recommendation,
      sectorExposure,
      holdings: weightedHoldings
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;