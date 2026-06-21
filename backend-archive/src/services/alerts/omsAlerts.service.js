import { getExecutionAnalytics } from "../orders/executionAnalytics.service.js";
import { getBrokerHealthMetrics } from "../brokers/brokerHealth.service.js";

export async function getOmsAlerts() {
  const analytics = await getExecutionAnalytics();
  const brokerHealth = await getBrokerHealthMetrics();

  const alerts = [];

  if (analytics.rejectedOrders > 0) {
    alerts.push({
      severity: "HIGH",
      type: "ORDER_REJECTIONS",
      message: `${analytics.rejectedOrders} rejected orders detected.`
    });
  }

  if (analytics.cancelledOrders > 3) {
    alerts.push({
      severity: "MEDIUM",
      type: "ORDER_CANCELLATIONS",
      message: "High cancellation activity detected."
    });
  }

  for (const broker of brokerHealth) {
    if (broker.brokerHealth === "DEGRADED") {
      alerts.push({
        severity: "MEDIUM",
        type: "BROKER_DEGRADED",
        message: `${broker.broker} broker performance degraded.`
      });
    }

    if (broker.brokerHealth === "DOWN") {
      alerts.push({
        severity: "HIGH",
        type: "BROKER_DOWN",
        message: `${broker.broker} broker connection unavailable.`
      });
    }

    if (broker.brokerLatencyMs > 200) {
      alerts.push({
        severity: "LOW",
        type: "LATENCY_SPIKE",
        message: `${broker.broker} latency spike detected (${broker.brokerLatencyMs} ms).`
      });
    }
  }

  if (alerts.length === 0) {
    alerts.push({
      severity: "INFO",
      type: "SYSTEM_HEALTHY",
      message: "OMS operating normally."
    });
  }

  return alerts;
}