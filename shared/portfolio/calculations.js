/**
 * ============================================================================
 * STATUS: DEV
 * MODULE: Shared Portfolio Calculations
 * MODULE ID: PORT-001
 * ENGINE ID: ENG-PORT-001
 * PURPOSE: Single source of truth for GateCEP portfolio valuation.
 * LAST VERIFIED: 2026-06-29
 * ============================================================================
 */

function n(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function normalizeSymbol(symbol) {
  return String(symbol || "").trim().toUpperCase();
}

export function getMarketPrice(holding = {}, priceMap = {}) {
  const symbol = normalizeSymbol(holding.symbol);
  const market = priceMap[symbol] || {};

  return n(
    market.price ||
      market.lastPrice ||
      market.currentPrice ||
      holding.marketPrice ||
      holding.price ||
      holding.averagePrice ||
      holding.averageCost
  );
}

export function calculateHoldingValue(holding = {}, priceMap = {}) {
  const quantity = n(holding.quantity);
  const averageCost = n(
    holding.averageCost || holding.averagePrice || holding.costPrice
  );
  const marketPrice = getMarketPrice(holding, priceMap);

  const marketValue = quantity * marketPrice;
  const investedValue = quantity * averageCost;
  const profitLoss = marketValue - investedValue;
  const profitLossPct =
    investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;

  return {
    ...holding,
    symbol: normalizeSymbol(holding.symbol),
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
    profitLossPct,
    changePct: n(holding.changePct)
  };
}

export function calculateHoldings(holdings = [], priceMap = {}) {
  return holdings.map((holding) => calculateHoldingValue(holding, priceMap));
}

export function calculatePortfolioSummary({
  holdings = [],
  cash = 0,
  priceMap = {}
} = {}) {
  const valuedHoldings = calculateHoldings(holdings, priceMap);

  const totalValue = valuedHoldings.reduce(
    (sum, holding) => sum + n(holding.marketValue),
    0
  );

  const investedValue = valuedHoldings.reduce(
    (sum, holding) => sum + n(holding.investedValue),
    0
  );

  const totalGain = totalValue - investedValue;
  const totalGainPct =
    investedValue > 0 ? (totalGain / investedValue) * 100 : 0;

  const totalCash = n(cash);
  const netWorth = totalValue + totalCash;

  return {
    holdings: valuedHoldings,
    summary: {
      totalValue,
      investedValue,
      totalCash,
      netWorth,
      totalGain,
      totalGainPct,
      holdingsCount: valuedHoldings.length
    }
  };
}

export function calculateAllocationBySector(holdings = []) {
  const totalValue = holdings.reduce(
    (sum, holding) => sum + n(holding.marketValue || holding.value),
    0
  );

  const sectors = {};

  holdings.forEach((holding) => {
    const sector = holding.sector || "Unknown";
    const value = n(holding.marketValue || holding.value);

    sectors[sector] = (sectors[sector] || 0) + value;
  });

  return Object.entries(sectors)
    .map(([sector, value]) => ({
      sector,
      value,
      weight: totalValue > 0 ? (value / totalValue) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);
}

export function calculateLargestHolding(holdings = []) {
  const sorted = [...holdings].sort(
    (a, b) => n(b.marketValue || b.value) - n(a.marketValue || a.value)
  );

  const largest = sorted[0] || null;

  if (!largest) {
    return null;
  }

  const totalValue = holdings.reduce(
    (sum, holding) => sum + n(holding.marketValue || holding.value),
    0
  );

  return {
    symbol: largest.symbol,
    name: largest.name,
    value: n(largest.marketValue || largest.value),
    weight:
      totalValue > 0
        ? (n(largest.marketValue || largest.value) / totalValue) * 100
        : 0
  };
}

export function calculateGoalProgress({
  currentValue = 0,
  targetValue = 0
} = {}) {
  const current = n(currentValue);
  const target = n(targetValue);

  return {
    currentValue: current,
    targetValue: target,
    progressPct: target > 0 ? Math.min((current / target) * 100, 100) : 0,
    remainingValue: Math.max(target - current, 0)
  };
}