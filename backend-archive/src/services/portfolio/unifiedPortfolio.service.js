import { getBrokerMirror } from "../../repositories/brokerMirror.repository.js";
import { marketDataGateway } from "../marketData/MarketDataGateway.js";
import { getMarketMetadata } from "../market/marketMetadata.service.js";

function cleanNumber(value) {
  const cleaned = String(value ?? 0)
    .replaceAll(",", "")
    .replaceAll("'", "")
    .replace(/KES/gi, "")
    .trim();

  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function normalizeSymbol(value) {
  return String(value || "").toUpperCase().trim();
}

function isTrustedMarketFeed(prices) {
  const source = String(
    prices?.source || prices?.provider || prices?.feedType || ""
  ).toUpperCase();

  if (!source) return false;

  return ![
    "STATIC",
    "STATIC_SEED",
    "DEMO",
    "DEMO_FEED",
    "SIMULATED",
    "MOCK"
  ].includes(source);
}

export async function getUnifiedPortfolio(options = {}) {
  const broker = options.broker || "AIB";

  const valuationRows = getBrokerMirror(broker, "valuation");
  const holdingRows = getBrokerMirror(broker, "holdings");

  const sourceRows =
    valuationRows.length > 0 ? valuationRows : holdingRows;

  const source =
    valuationRows.length > 0 ? "BROKER_VALUATION" : "BROKER_HOLDINGS";

  const prices = await marketDataGateway.getPrices();
  const trustedLiveFeed = isTrustedMarketFeed(prices);

  const priceMap = new Map();

  for (const item of prices.data || []) {
    priceMap.set(
      normalizeSymbol(item.symbol),
      Number(item.price || item.lastPrice || 0)
    );
  }

  const holdings = sourceRows
    .map((row) => {
      const symbol = normalizeSymbol(row.symbol);
      if (!symbol) return null;

      const metadata = getMarketMetadata(symbol);

      const quantity = cleanNumber(row.quantity);

      const averageCost = cleanNumber(
        row.averageCost || row.averagePrice || row.avgPrice || row.costPrice
      );

      const uploadedMarketPrice = cleanNumber(
        row.marketPrice || row.price || row.lastPrice
      );

      const liveMarketPrice = cleanNumber(priceMap.get(symbol));

      const marketPrice =
        trustedLiveFeed && liveMarketPrice > 0
          ? liveMarketPrice
          : uploadedMarketPrice > 0
          ? uploadedMarketPrice
          : averageCost;

      const marketValue = Number((quantity * marketPrice).toFixed(2));
      const costValue = Number((quantity * averageCost).toFixed(2));
      const unrealizedPnL = Number((marketValue - costValue).toFixed(2));

      const unrealizedPnLPercent =
        costValue > 0
          ? Number(((unrealizedPnL / costValue) * 100).toFixed(2))
          : 0;

      return {
        broker: row.broker || broker,
        clientNumber: row.clientNumber || "",
        cdsNumber: row.cdsNumber || "",
        symbol,
        name: row.name || metadata.name || symbol,
        sector: row.sector || metadata.sector || "Unknown",
        quantity,
        averageCost,
        averagePrice: averageCost,
        marketPrice,
        price: marketPrice,
        lastPrice: marketPrice,
        marketValue,
        value: marketValue,
        costValue,
        investedValue: costValue,
        unrealizedPnL,
        profitLoss: unrealizedPnL,
        unrealizedPnLPercent,
        profitLossPct: unrealizedPnLPercent,
        realizedPnL: 0,
        hasLivePrice: trustedLiveFeed && liveMarketPrice > 0,
        priceSource:
          trustedLiveFeed && liveMarketPrice > 0
            ? "LIVE_MARKET"
            : uploadedMarketPrice > 0
            ? "BROKER_VALUATION"
            : "AVERAGE_COST_FALLBACK",
        updatedAt: row.importedAt || row.uploadedAt || new Date().toISOString()
      };
    })
    .filter(Boolean);

  const brokersMap = new Map();

  for (const holding of holdings) {
    const current =
      brokersMap.get(holding.broker) || {
        broker: holding.broker,
        marketValue: 0,
        unrealizedPnL: 0,
        realizedPnL: 0,
        holdings: 0
      };

    current.marketValue += holding.marketValue;
    current.unrealizedPnL += holding.unrealizedPnL;
    current.realizedPnL += holding.realizedPnL;
    current.holdings += 1;

    brokersMap.set(holding.broker, current);
  }

  const brokers = Array.from(brokersMap.values()).map((item) => ({
    ...item,
    marketValue: Number(item.marketValue.toFixed(2)),
    unrealizedPnL: Number(item.unrealizedPnL.toFixed(2)),
    realizedPnL: Number(item.realizedPnL.toFixed(2))
  }));

  const totalMarketValue = Number(
    holdings.reduce((sum, item) => sum + item.marketValue, 0).toFixed(2)
  );

  const totalUnrealizedPnL = Number(
    holdings.reduce((sum, item) => sum + item.unrealizedPnL, 0).toFixed(2)
  );

  const totalRealizedPnL = Number(
    holdings.reduce((sum, item) => sum + item.realizedPnL, 0).toFixed(2)
  );

  return {
    totalMarketValue,
    totalUnrealizedPnL,
    totalRealizedPnL,
    totalPnL: Number((totalUnrealizedPnL + totalRealizedPnL).toFixed(2)),
    brokerCount: brokers.length,
    holdingCount: holdings.length,
    brokers,
    holdings,
    source,
    priceSource: trustedLiveFeed ? "LIVE_MARKET" : "BROKER_VALUATION_OR_FALLBACK",
    generatedAt: new Date().toISOString()
  };
}