// backend/src/services/domain/coach/CoachService.js

export function generateCoachDashboardInsights({
  holdings = [],
  brokers = [],
  largestHolding = null,
  largestSector = null,
  totalCash = 0,
  netWorth = 0,
  gainPct = 0
}) {
  const cashWeight =
    netWorth > 0 ? Number(((totalCash / netWorth) * 100).toFixed(2)) : 0;

  const recommendations = [];

  if (!brokers.length) {
    recommendations.push({
      type: "BROKER",
      priority: "HIGH",
      title: "Connect a broker",
      message:
        "Link at least one broker account so Gatecep can track your portfolio."
    });
  }

  if (!holdings.length) {
    recommendations.push({
      type: "PORTFOLIO",
      priority: "HIGH",
      title: "Add your first holding",
      message:
        "Upload a valuation statement or manually add your first investment."
    });
  }

  if (largestHolding?.weight > 30) {
    recommendations.push({
      type: "CONCENTRATION",
      priority: "MEDIUM",
      title: "Reduce concentration risk",
      message: `${largestHolding.symbol} is ${largestHolding.weight}% of your portfolio. Consider reducing below 25–30%.`
    });
  }

  if (largestSector?.weight > 50) {
    recommendations.push({
      type: "SECTOR",
      priority: "MEDIUM",
      title: "Diversify sector exposure",
      message: `${largestSector.sector} is ${largestSector.weight}% of your portfolio. Consider diversifying into other sectors or ETFs.`
    });
  }

  if (cashWeight < 5 && netWorth > 0) {
    recommendations.push({
      type: "CASH",
      priority: "MEDIUM",
      title: "Increase cash buffer",
      message:
        "Your cash buffer is below 5% of net worth. Consider keeping more liquidity for opportunities or emergencies."
    });
  }

  if (cashWeight > 20) {
    recommendations.push({
      type: "CASH",
      priority: "LOW",
      title: "Deploy excess cash",
      message:
        "You have a healthy cash balance. Consider investing part of it according to your goals and risk profile."
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      type: "REVIEW",
      priority: "LOW",
      title: "Portfolio looks balanced",
      message:
        "No major concentration or cash risks detected from your current data."
    });
  }

  const portfolioScore = Math.max(
    0,
    Math.min(
      100,
      80 +
        (gainPct > 0 ? 10 : -10) -
        (largestHolding?.weight > 30 ? 10 : 0) -
        (largestSector?.weight > 50 ? 10 : 0) +
        (cashWeight >= 5 && cashWeight <= 20 ? 10 : 0)
    )
  );

  return {
    cashWeight,
    recommendations,
    scores: {
      portfolioScore,
      riskScore:
        largestHolding?.weight > 30 || largestSector?.weight > 50 ? 65 : 85,
      cashScore: cashWeight >= 5 && cashWeight <= 20 ? 90 : 65
    },
    coachMessage:
      recommendations[0]?.message || "Coach G has reviewed your portfolio."
  };
}