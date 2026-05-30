import express from "express";

import { getBrokerMirror } from "../repositories/brokerMirror.repository.js";
import { marketDataGateway } from "../services/marketData/MarketDataGateway.js";

const router = express.Router();

router.get("/:broker", async (req, res) => {
  try {
    const broker = String(req.params.broker || "AIB").toUpperCase();

    const riskProfiles = {
      conservative: { maxStockWeight: 20, maxSectorWeight: 30, cashBufferPct: 15 },
      balanced: { maxStockWeight: 25, maxSectorWeight: 40, cashBufferPct: 10 },
      aggressive: { maxStockWeight: 35, maxSectorWeight: 50, cashBufferPct: 5 }
    };

    const risk = String(req.query.risk || "balanced").toLowerCase();
    const profile = riskProfiles[risk] || riskProfiles.balanced;

    const holdings = getBrokerMirror(broker, "holdings");
    const pricesResult = await marketDataGateway.getPrices();
    const marketRows = pricesResult.data || [];

    const marketLookup = Object.fromEntries(
      marketRows.map((item) => [
        String(item.symbol || "").trim(),
        item
      ])
    );

    const valuedHoldings = holdings.map((h) => {
      const symbol = String(h.symbol || "").trim();
      const market = marketLookup[symbol] || {};
      const quantity = Number(h.quantity || 0);
      const price = Number(market.price || market.lastPrice || 0);
      const marketValue = quantity * price;

      return {
        ...h,
        symbol,
        quantity,
        price,
        sector: market.sector || "Unknown",
        changePct: Number(market.changePct || 0),
        marketValue,
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

    const sellCandidates = valuedHoldings
      .filter((item) => item.weight > profile.maxStockWeight)
      .map((item) => {
        const excessWeight = item.weight - profile.maxStockWeight;
        const estimatedSellValue = Number(
          ((excessWeight / 100) * totalValue).toFixed(2)
        );

        return {
          action: "SELL_REDUCE",
          symbol: item.symbol,
          currentWeight: item.weight,
          targetWeight: profile.maxStockWeight,
          estimatedSellValue,
          reason: `${item.symbol} exceeds ${risk} max stock weight of ${profile.maxStockWeight}%.`
        };
      });

    const totalSellValue = sellCandidates.reduce(
      (sum, item) => sum + Number(item.estimatedSellValue || 0),
      0
    );

    const cashBuffer = Number(
      ((profile.cashBufferPct / 100) * totalSellValue).toFixed(2)
    );

    const allocatableCash = Math.max(totalSellValue - cashBuffer, 0);

    const ownedSymbols = new Set(
      valuedHoldings.map((item) => String(item.symbol || "").trim())
    );

    const rawBuyCandidates = marketRows
      .filter((item) => !ownedSymbols.has(String(item.symbol || "").trim()))
      .filter((item) => Number(item.changePct || 0) > 1)
      .sort((a, b) => Number(b.changePct || 0) - Number(a.changePct || 0))
      .slice(0, 5);

    const perBuyAllocation =
      rawBuyCandidates.length > 0
        ? Number((allocatableCash / rawBuyCandidates.length).toFixed(2))
        : 0;

    const buyCandidates = rawBuyCandidates.map((item) => ({
      action: "BUY_CONSIDER",
      symbol: item.symbol,
      name: item.name,
      sector: item.sector,
      price: Number(item.price || item.lastPrice || 0),
      changePct: Number(item.changePct || 0),
      suggestedAllocation: perBuyAllocation,
      reason: "Positive market trend and adds diversification."
    }));

    res.json({
      ok: true,
      broker,
      mode: "ADVISORY_ONLY",
      message: "This is a Coach G recommendation only. Gatecep will not execute trades.",
      riskProfile: risk,
      profile,
      totalValue,
      riskBefore: valuedHoldings.some((item) => item.weight >= 40)
        ? "HIGH"
        : "MODERATE",
      totalSellValue,
      cashBuffer,
      allocatableCash,
      sellCandidates,
      buyCandidates,
      recommendation:
        sellCandidates.length > 0
          ? "Reduce concentrated positions and reallocate toward diversified positive-trend opportunities."
          : "Portfolio concentration is acceptable. Consider only selective opportunities."
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;