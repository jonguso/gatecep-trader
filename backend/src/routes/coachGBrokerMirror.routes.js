import express from "express";

import {
  getBrokerMirror
} from "../repositories/brokerMirror.repository.js";

import {
  marketDataGateway
} from "../services/marketData/MarketDataGateway.js";

const router = express.Router();

router.get("/insight/:broker", async (req, res) => {
  try {
    const broker = String(req.params.broker || "AIB").toUpperCase();

    const holdings = getBrokerMirror(broker, "holdings");

    const pricesResult = await marketDataGateway.getPrices();

    const marketLookup = Object.fromEntries(
  (pricesResult.data || []).map((item) => [
    String(item.symbol || "").trim(),
    {
      price: Number(item.price || item.lastPrice || 0),
      sector: item.sector || "Unknown"
    }
  ])
);

    const valuedHoldings = holdings.map((h) => {
      const symbol = String(h.symbol || "").trim();
      const quantity = Number(h.quantity || 0);
      const market = marketLookup[symbol] || {};
      const price = Number(market.price || 0);
      const sector = market.sector || "Unknown";
      const marketValue = quantity * price;

      return {
  ...h,
  symbol,
  quantity,
  price,
  sector,
  marketValue
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
      holdings: []
    };
  }

  sectorMap[sector].marketValue += Number(item.marketValue || 0);
  sectorMap[sector].holdings.push(item.symbol);
}

const sectorExposure = Object.values(sectorMap)
  .map((sector) => ({
    ...sector,
    weight:
      totalValue > 0
        ? Number(((sector.marketValue / totalValue) * 100).toFixed(2))
        : 0
  }))
  .sort((a, b) => b.weight - a.weight);

    const topHolding = [...weightedHoldings].sort(
      (a, b) => Number(b.weight || 0) - Number(a.weight || 0)
    )[0];

    const topExposurePct = Number(topHolding?.weight || 0);

    const riskLevel =
      topExposurePct >= 40
        ? "HIGH"
        : topExposurePct >= 25
        ? "MEDIUM"
        : "LOW";

    const recommendation =
      riskLevel === "HIGH"
        ? `Your ${broker} mirror is highly concentrated in ${topHolding.symbol} by market value at ${topExposurePct}%. Consider diversifying.`
        : riskLevel === "MEDIUM"
        ? `Your ${broker} mirror has moderate concentration in ${topHolding.symbol} at ${topExposurePct}%. Monitor before adding more.`
        : `Your ${broker} mirror appears reasonably diversified by market value.`;

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
  riskLevel === "HIGH" || sectorRiskLevel === "HIGH"
    ? "HIGH"
    : riskLevel === "MEDIUM" || sectorRiskLevel === "MEDIUM"
    ? "MEDIUM"
    : "LOW";

const enhancedRecommendation =
  combinedRiskLevel === "HIGH"
    ? `Your largest position is ${topHolding.symbol} at ${topExposurePct}% of portfolio value. Your largest sector is ${topSector?.sector} at ${topSector?.weight}%. Risk level is HIGH. Consider reducing concentration or adding exposure to other sectors.`
    : combinedRiskLevel === "MEDIUM"
    ? `Your portfolio has moderate concentration. ${topHolding.symbol} is ${topExposurePct}% and ${topSector?.sector} is ${topSector?.weight}%. Monitor before adding more.`
    : `Your portfolio appears reasonably diversified by holding and sector exposure.`;

    res.json({
      ok: true,
      broker,
      totalValue,
      holdingsCount: holdings.length,
      topHolding: topHolding || null,
      topExposurePct,
      riskLevel: combinedRiskLevel,
      recommendation: enhancedRecommendation,
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