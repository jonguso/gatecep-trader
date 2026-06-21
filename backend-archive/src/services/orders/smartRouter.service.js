import { getExecutionAnalytics } from "./executionAnalytics.service.js";

function calculateBrokerScore(stats) {
  const totalOrders = stats.totalOrders || 0;

  if (totalOrders === 0) {
    return 0;
  }

  const fillRate =
    (stats.filledOrders || 0) / totalOrders;

  const rejectionRate =
    (stats.rejectedOrders || 0) / totalOrders;

  const cancelRate =
    (stats.cancelledOrders || 0) / totalOrders;

  const score =
    fillRate * 100 -
    rejectionRate * 70 -
    cancelRate * 20;

  return Number(score.toFixed(2));
}

export async function getSmartRoutingRecommendation() {
  const analytics = await getExecutionAnalytics();

  const brokerStats = analytics.brokerStats || {};

  const brokerScores = {};

  for (const broker of Object.keys(brokerStats)) {
    brokerScores[broker] =
      calculateBrokerScore(brokerStats[broker]);
  }

  let recommendedBroker = null;
  let bestExecutionBroker = null;
  let worstExecutionBroker = null;

  let highestScore = -Infinity;
  let lowestScore = Infinity;

  for (const [broker, score] of Object.entries(
    brokerScores
  )) {
    if (score > highestScore) {
      highestScore = score;
      recommendedBroker = broker;
      bestExecutionBroker = broker;
    }

    if (score < lowestScore) {
      lowestScore = score;
      worstExecutionBroker = broker;
    }
  }

  return {
    recommendedBroker,
    bestExecutionBroker,
    worstExecutionBroker,
    brokerScores
  };
}