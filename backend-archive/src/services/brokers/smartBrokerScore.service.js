import { getExecutionAnalytics } from "../orders/executionAnalytics.service.js";

const brokerHealth = {
  AIB: {
    uptime: 98,
    latencyMs: 120,
    liquidityScore: 85
  },
  ABC: {
    uptime: 95,
    latencyMs: 180,
    liquidityScore: 78
  },
  NCBA: {
    uptime: 91,
    latencyMs: 240,
    liquidityScore: 72
  }
};

function latencyScore(latencyMs) {
  return Math.max(
    0,
    100 - latencyMs / 3
  );
}

export async function getSmartBrokerScores() {
  const analytics = await getExecutionAnalytics();

  const brokerStats =
    analytics.brokerStats || {};

  return Object.entries(brokerHealth).map(
    ([broker, health]) => {
      const stats =
        brokerStats[broker] || {
          totalOrders: 0,
          filledOrders: 0,
          rejectedOrders: 0
        };

      const fillRate =
        stats.totalOrders > 0
          ? (stats.filledOrders / stats.totalOrders) * 100
          : 75;

      const rejectionRate =
        stats.totalOrders > 0
          ? (stats.rejectedOrders / stats.totalOrders) * 100
          : 5;

      const score =
        fillRate * 0.35 +
        health.uptime * 0.25 +
        latencyScore(health.latencyMs) * 0.2 +
        health.liquidityScore * 0.2 -
        rejectionRate * 0.2;

      return {
        broker,
        score: Number(score.toFixed(2)),
        fillRate: Number(fillRate.toFixed(2)),
        rejectionRate: Number(rejectionRate.toFixed(2)),
        uptime: health.uptime,
        latencyMs: health.latencyMs,
        latencyScore: Number(
          latencyScore(health.latencyMs).toFixed(2)
        ),
        liquidityScore: health.liquidityScore
      };
    }
  ).sort((a, b) => b.score - a.score);
}

export async function getBestExecutionBroker() {
  const scores = await getSmartBrokerScores();

  return scores[0]?.broker || "AIB";
}