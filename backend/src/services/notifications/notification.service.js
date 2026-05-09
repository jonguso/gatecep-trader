import { getExecutionQueue } from "../orders/executionQueue.service.js";
import { getOmsAlerts } from "../alerts/omsAlerts.service.js";
import { getComplianceAlerts } from "../compliance/compliance.service.js";

export async function getNotifications() {
  const orders = await getExecutionQueue();
  const omsAlerts = await getOmsAlerts();
  const compliance = await getComplianceAlerts();

  const notifications = [];

  for (const order of orders.slice(0, 10)) {
    if (order.status === "FILLED") {
      notifications.push({
        type: "ORDER_FILLED",
        severity: "SUCCESS",
        message: `${order.symbol} ${order.side} order filled via ${order.broker}.`,
        timestamp: order.updatedAt
      });
    }

    if (order.status === "REJECTED") {
      notifications.push({
        type: "ORDER_REJECTED",
        severity: "HIGH",
        message: `${order.symbol} order rejected: ${order.rejectionReason}.`,
        timestamp: order.updatedAt
      });
    }
  }

  for (const alert of omsAlerts) {
    notifications.push({
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      timestamp: new Date().toISOString()
    });
  }

  for (const alert of compliance.alerts || []) {
    notifications.push({
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      timestamp: new Date().toISOString()
    });
  }

  return notifications
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 25);
}