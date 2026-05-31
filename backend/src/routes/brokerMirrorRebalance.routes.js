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

router.get("/:broker", async (req, res) => {
  try {
    const broker = String(req.params.broker || "AIB").toUpperCase();

    const riskProfiles = {
      conservative: {
        maxStockWeight: 20,
        maxSectorWeight: 30,
        cashBufferPct: 15
      },
      balanced: {
        maxStockWeight: 25,
        maxSectorWeight: 40,
        cashBufferPct: 10
      },
      aggressive: {
        maxStockWeight: 35,
        maxSectorWeight: 50,
        cashBufferPct: 5
      }
    };

    const risk = String(req.query.risk || "balanced").toLowerCase();
    const profile = riskProfiles[risk] || riskProfiles.balanced;

    const valuations = getBrokerMirror(broker, "valuation");
    const mirrorHoldings = getBrokerMirror(broker, "holdings");

    const sourceRows =
      valuations.length > 0
        ? valuations
        : mirrorHoldings;

    const source =
      valuations.length > 0
        ? "BROKER_VALUATION"
        : "HOLDINGS_MARKET_ESTIMATE";

    const pricesResult = await marketDataGateway.getPrices();
    const marketRows = pricesResult.data || [];

    const marketLookup = Object.fromEntries(
      marketRows.map((item) => [
        normalizeNseSymbol(item.symbol),
        item
      ])
    );

    const valuedHoldings = sourceRows.map((h) => {
      const symbol = normalizeNseSymbol(h.symbol);
      const market = marketLookup[symbol] || {};

      const quantity = Number(h.quantity || 0);

      const price = Number(
        h.marketPrice ||
          h.price ||
          market.price ||
          market.lastPrice ||
          0
      );

      const marketValue = Number(
        h.marketValue ||
          quantity * price
      );

      const averagePrice = Number(
        h.averagePrice ||
          h.avgPrice ||
          0
      );

      const profitLoss = Number(
        h.profitLoss ||
          marketValue - quantity * averagePrice ||
          0
      );

      const profitLossPct = Number(
        h.profitLossPct ||
          (
            quantity * averagePrice > 0
              ? (profitLoss / (quantity * averagePrice)) * 100
              : 0
          )
      );

      return {
        ...h,
        symbol,
        name: h.name || market.name || "",
        quantity,
        averagePrice,
        price,
        sector: market.sector || h.sector || "Unknown",
        changePct: Number(
          h.profitLossPct ||
            market.changePct ||
            0
        ),
        marketValue,
        profitLoss,
        profitLossPct: Number(profitLossPct.toFixed(2)),
        weight: 0
      };
    });

    const totalValue = valuedHoldings.reduce(
      (sum, item) =>
        sum + Number(item.marketValue || 0),
      0
    );

    const totalCost = valuedHoldings.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0) *
          Number(item.averagePrice || 0),
      0
    );

    const totalProfitLoss = valuedHoldings.reduce(
      (sum, item) =>
        sum + Number(item.profitLoss || 0),
      0
    );

    const totalReturnPct =
      totalCost > 0
        ? Number(
            ((totalProfitLoss / totalCost) * 100).toFixed(2)
          )
        : 0;

    valuedHoldings.forEach((item) => {
      item.weight =
        totalValue > 0
          ? Number(
              ((item.marketValue / totalValue) * 100).toFixed(2)
            )
          : 0;
    });

    const sectorExposureMap = {};

    valuedHoldings.forEach((item) => {
      const sector = item.sector || "Unknown";

      if (!sectorExposureMap[sector]) {
        sectorExposureMap[sector] = {
          sector,
          marketValue: 0,
          profitLoss: 0,
          holdings: []
        };
      }

      sectorExposureMap[sector].marketValue += Number(
        item.marketValue || 0
      );

      sectorExposureMap[sector].profitLoss += Number(
        item.profitLoss || 0
      );

      sectorExposureMap[sector].holdings.push(item.symbol);
    });

    const sectorExposure = Object.values(sectorExposureMap)
      .map((item) => ({
        ...item,
        marketValue: Number(item.marketValue.toFixed(2)),
        profitLoss: Number(item.profitLoss.toFixed(2)),
        weight:
          totalValue > 0
            ? Number(
                ((item.marketValue / totalValue) * 100).toFixed(2)
              )
            : 0
      }))
      .sort((a, b) => b.weight - a.weight);

    const sellCandidates = valuedHoldings
      .filter((item) => item.weight > profile.maxStockWeight)
      .map((item) => {
        const excessWeight =
          item.weight - profile.maxStockWeight;

        const estimatedSellValue = Number(
          ((excessWeight / 100) * totalValue).toFixed(2)
        );

        return {
          action: "SELL_REDUCE",
          symbol: item.symbol,
          name: item.name,
          sector: item.sector,
          currentWeight: item.weight,
          targetWeight: profile.maxStockWeight,
          estimatedSellValue,
          reason:
            `${item.symbol} exceeds ${risk} max stock weight of ${profile.maxStockWeight}%.`
        };
      });

    const totalSellValue = sellCandidates.reduce(
      (sum, item) =>
        sum + Number(item.estimatedSellValue || 0),
      0
    );

    const cashBuffer = Number(
      ((profile.cashBufferPct / 100) * totalSellValue).toFixed(2)
    );

    const allocatableCash =
      Math.max(totalSellValue - cashBuffer, 0);

    const ownedSymbols = new Set(
      valuedHoldings.map((item) => item.symbol)
    );

    const overweightSectors = new Set(
      sectorExposure
        .filter((item) => item.weight > profile.maxSectorWeight)
        .map((item) => item.sector)
    );

    const rawBuyCandidates = marketRows
      .filter((item) => {
        const symbol = normalizeNseSymbol(item.symbol);
        return !ownedSymbols.has(symbol);
      })
      .filter((item) => {
        const sector = item.sector || "Unknown";
        return !overweightSectors.has(sector);
      })
      .filter((item) => Number(item.changePct || 0) > 1)
      .sort(
        (a, b) =>
          Number(b.changePct || 0) -
          Number(a.changePct || 0)
      )
      .slice(0, 5);

    const perBuyAllocation =
      rawBuyCandidates.length > 0
        ? Number(
            (allocatableCash / rawBuyCandidates.length).toFixed(2)
          )
        : 0;

    const buyCandidates = rawBuyCandidates.map((item) => ({
      action: "BUY_CONSIDER",
      symbol: normalizeNseSymbol(item.symbol),
      name: item.name,
      sector: item.sector,
      price: Number(item.price || item.lastPrice || 0),
      changePct: Number(item.changePct || 0),
      suggestedAllocation: perBuyAllocation,
      reason:
        "Positive market trend and adds diversification outside overweight sectors."
    }));

    const largestHolding =
      [...valuedHoldings].sort(
        (a, b) => b.weight - a.weight
      )[0] || null;

    const largestSector =
      sectorExposure[0] || null;

    const riskBefore =
      largestHolding?.weight >= 40 ||
      largestSector?.weight >= 40
        ? "HIGH"
        : "MODERATE";

    res.json({
      ok: true,
      broker,
      source,
      mode: "ADVISORY_ONLY",
      message:
        "This is a Coach G recommendation only. Gatecep will not execute trades.",
      riskProfile: risk,
      profile,
      totalValue: Number(totalValue.toFixed(2)),
      totalCost: Number(totalCost.toFixed(2)),
      totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
      totalReturnPct,
      riskBefore,
      largestHolding,
      largestSector,
      sectorExposure,
      holdings: valuedHoldings,
      totalSellValue,
      cashBuffer,
      allocatableCash,
      sellCandidates,
      buyCandidates,
      recommendation:
        sellCandidates.length > 0
          ? "Reduce concentrated positions or use new capital to diversify into underrepresented sectors."
          : "Portfolio concentration is acceptable. Consider selective opportunities."
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;