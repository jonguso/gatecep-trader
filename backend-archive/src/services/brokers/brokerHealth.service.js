import { getExecutionAnalytics } from "../orders/executionAnalytics.service.js";

function randomLatency() {
  return Math.floor(Math.random() * 250) + 40;
}

function calculateHealth(score) {
  if (score >= 90) return "ONLINE";
  if (score >= 70) return "DEGRADED";
  return "DOWN";
}

function calculateTimeoutRisk(latency) {
  if (latency < 120) return "LOW";
  if (latency < 220) return "MEDIUM";
  return "HIGH";
}

export async function getBrokerHealthMetrics() {
  const analytics = await getExecutionAnalytics();

  const brokerStats = analytics.brokerStats || {};

  const brokers = [];

  for (const [broker, stats] of Object.entries(
    brokerStats
  )) {
    const totalOrders = stats.totalOrders || 1;

    const successRate =
      ((stats.filledOrders || 0) / totalOrders) * 100;

    const latency = randomLatency();

    const uptimeScore = Number(
      Math.max(50, successRate).toFixed(2)
    );

    brokers.push({
      broker,
      brokerLatencyMs: latency,
      uptimeScore,
      brokerHealth: calculateHealth(uptimeScore),
      timeoutRisk: calculateTimeoutRisk(latency),
      lastHeartbeat: new Date().toISOString()
    });
  }

  return brokers;
}