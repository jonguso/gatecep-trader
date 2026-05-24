import { getPositions } from "../positions/position.service.js";
import { marketDataGateway } from "../marketData/MarketDataGateway.js";
import {
  getMarketMetadata
} from "../market/marketMetadata.service.js";

export async function getUnifiedPortfolio() {
  const positions = await getPositions();

  const prices = await marketDataGateway.getPrices();
  
const priceMap = new Map();

  for (const item of prices.data || []) {
    priceMap.set(item.symbol, Number(item.price || item.lastPrice || 0));
  }

  const holdings = positions.map((position) => {
  const metadata = getMarketMetadata(position.symbol);
    const marketPrice =
      priceMap.get(position.symbol) || position.averageCost || 0;

    const marketValue =
      Number(position.quantity || 0) * marketPrice;

    const costValue =
      Number(position.quantity || 0) * Number(position.averageCost || 0);

    const unrealizedPnL =
      Number((marketValue - costValue).toFixed(2));

    const unrealizedPnLPercent =
      costValue > 0
        ? Number(((unrealizedPnL / costValue) * 100).toFixed(2))
        : 0;
    

   return {
  broker: position.broker,
  symbol: position.symbol,
  name: metadata.name,
  sector: metadata.sector,
  quantity: position.quantity,
  averageCost: position.averageCost,
  marketPrice,
  marketValue,
  unrealizedPnL,
  unrealizedPnLPercent,
  realizedPnL: position.realizedPnL,
  updatedAt: position.updatedAt
};
  });

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

  const brokers = Array.from(brokersMap.values()).map((broker) => ({
    ...broker,
    marketValue: Number(broker.marketValue.toFixed(2)),
    unrealizedPnL: Number(broker.unrealizedPnL.toFixed(2)),
    realizedPnL: Number(broker.realizedPnL.toFixed(2))
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
    generatedAt: new Date().toISOString()
  };
}