export function getPortfolioPerformance() {
  const points = [];

  let portfolioValue = 1000000;

  for (let i = 1; i <= 30; i++) {
    const dailyMove =
      (Math.random() * 4 - 1.5) / 100;

    portfolioValue =
      portfolioValue * (1 + dailyMove);

    points.push({
      day: `Day ${i}`,
      portfolioValue: Number(
        portfolioValue.toFixed(2)
      ),
      pnl: Number(
        (portfolioValue - 1000000).toFixed(2)
      ),
      buyingPower: Number(
        (1000000 - (portfolioValue - 950000)).toFixed(2)
      )
    });
  }

  return {
    points
  };
}