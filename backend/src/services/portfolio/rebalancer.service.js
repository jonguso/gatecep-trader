import { getPortfolio } from "./portfolio.service.js";

const targetAllocation = {
  SCOM: 40,
  EQTY: 25,
  KCB: 20,
  COOP: 15
};

export async function getRebalancePlan() {
  const portfolio = await getPortfolio();

  const totalValue = portfolio.totalMarketValue || 1;

  const recommendations = portfolio.positions.map((position) => {
    const currentWeight = Number(
      ((position.marketValue / totalValue) * 100).toFixed(2)
    );

    const targetWeight = targetAllocation[position.symbol] || 0;
    const drift = Number((currentWeight - targetWeight).toFixed(2));

    let action = "HOLD";

    if (drift > 5) action = "SELL";
    if (drift < -5) action = "BUY";

    const targetValue = Number(((targetWeight / 100) * totalValue).toFixed(2));
    const valueDifference = Number((targetValue - position.marketValue).toFixed(2));

    return {
      symbol: position.symbol,
      currentWeight,
      targetWeight,
      drift,
      action,
      marketValue: position.marketValue,
      targetValue,
      valueDifference,
      confidence: Math.min(99, Math.max(60, 100 - Math.abs(drift)))
    };
  });

  return {
    portfolioValue: portfolio.totalMarketValue,
    targetAllocation,
    recommendations,
    generatedAt: new Date().toISOString()
  };
}