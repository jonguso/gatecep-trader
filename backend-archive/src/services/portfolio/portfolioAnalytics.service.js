import { getUnifiedPortfolio } from "./unifiedPortfolio.service.js";

function percent(value, total) {
  if (!total || total <= 0) return 0;
  return Number(((value / total) * 100).toFixed(2));
}

export async function getPortfolioAllocation() {
  const portfolio = await getUnifiedPortfolio();

  const bySymbolMap = new Map();
  const byBrokerMap = new Map();

  for (const holding of portfolio.holdings) {
    const symbolCurrent =
      bySymbolMap.get(holding.symbol) || {
        symbol: holding.symbol,
        marketValue: 0,
        quantity: 0
      };

    symbolCurrent.marketValue += holding.marketValue;
    symbolCurrent.quantity += Number(holding.quantity || 0);

    bySymbolMap.set(holding.symbol,
      symbolCurrent
    );

    const brokerCurrent =
      byBrokerMap.get(holding.broker) || {
        broker: holding.broker,
        marketValue: 0,
        holdings: 0
      };

    brokerCurrent.marketValue += holding.marketValue;
    brokerCurrent.holdings += 1;

    byBrokerMap.set(
      holding.broker,
      brokerCurrent
    );
  }

  const bySymbol = Array.from(bySymbolMap.values()).map((item) => ({
    ...item,
    marketValue: Number(item.marketValue.toFixed(2)),
    weight: percent(item.marketValue, portfolio.totalMarketValue)
  }));

  const byBroker = Array.from(byBrokerMap.values()).map((item) => ({
    ...item,
    marketValue: Number(item.marketValue.toFixed(2)),
    weight: percent(item.marketValue, portfolio.totalMarketValue)
  }));

  return {
    totalMarketValue: portfolio.totalMarketValue,
    bySymbol,
    byBroker,
    generatedAt: new Date().toISOString()
  };
}