/**
 * ============================================================================
 * STATUS: TEMPORARY
 * MODULE: Portfolio Engine Bridge
 * ENGINE: ENG-PORT-001
 *
 * PURPOSE:
 * Temporary mobile bridge while configuring the GateCEP monorepo.
 *
 * TODO:
 * Remove after Metro workspace configuration.
 *
 * TARGET RELEASE:
 * GateCEP 3.2
 * ============================================================================
 */

function n(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function normalizeSymbol(symbol) {
  return String(symbol || "").trim().toUpperCase();
}

export function calculateHoldingValue(holding = {}, priceMap = {}) {
  const symbol = normalizeSymbol(holding.symbol);
  const market = priceMap[symbol] || {};

  const quantity = n(holding.quantity);
  const averageCost = n(holding.averageCost || holding.averagePrice || holding.costPrice);
  const marketPrice = n(
    market.price ||
      market.lastPrice ||
      market.currentPrice ||
      holding.marketPrice ||
      holding.price ||
      holding.averagePrice ||
      holding.averageCost
  );

  const marketValue = quantity * marketPrice;
  const investedValue = quantity * averageCost;
  const profitLoss = marketValue - investedValue;

  return {
    ...holding,
    symbol,
    quantity,
    averageCost,
    averagePrice: averageCost,
    marketPrice,
    price: marketPrice,
    marketValue,
    value: marketValue,
    investedValue,
    costValue: investedValue,
    profitLoss,
    gain: profitLoss,
    profitLossPct: investedValue > 0 ? (profitLoss / investedValue) * 100 : 0
  };
}

export function calculateHoldings(holdings = [], priceMap = {}) {
  return holdings.map((holding) => calculateHoldingValue(holding, priceMap));
}

export function calculatePortfolioSummary({ holdings = [], cash = 0, priceMap = {} } = {}) {
  const valuedHoldings = calculateHoldings(holdings, priceMap);

  const totalValue = valuedHoldings.reduce((sum, h) => sum + n(h.marketValue), 0);
  const investedValue = valuedHoldings.reduce((sum, h) => sum + n(h.investedValue), 0);
  const totalGain = totalValue - investedValue;

  return {
    holdings: valuedHoldings,
    summary: {
      totalValue,
      investedValue,
      totalCash: n(cash),
      netWorth: totalValue + n(cash),
      totalGain,
      totalGainPct: investedValue > 0 ? (totalGain / investedValue) * 100 : 0,
      holdingsCount: valuedHoldings.length
    }
  };
}

export function calculateGoalProgress({ currentValue = 0, targetValue = 0 } = {}) {
  const current = n(currentValue);
  const target = n(targetValue);

  return {
    currentValue: current,
    targetValue: target,
    progressPct: target > 0 ? Math.min((current / target) * 100, 100) : 0,
    remainingValue: Math.max(target - current, 0)
  };
}