import { getExecutionQueue } from "../orders/executionQueue.service.js";

export async function getComplianceAlerts() {
  const orders = await getExecutionQueue();

  const alerts = [];

  const symbolExposure = {};

  for (const order of orders) {
    const qty = Number(order.quantity || 0);

    if (qty > 5000) {
      alerts.push({
        severity: "HIGH",
        type: "LARGE_ORDER",
        orderId: order.id,
        symbol: order.symbol,
        message: `Large order detected: ${qty} shares.`
      });
    }

    if (order.retryCount > 0) {
      alerts.push({
        severity: "MEDIUM",
        type: "BROKER_FAILOVER",
        orderId: order.id,
        symbol: order.symbol,
        message: `Broker failover triggered for ${order.symbol}.`
      });
    }

    if (order.status === "REJECTED") {
      alerts.push({
        severity: "HIGH",
        type: "ORDER_REJECTED",
        orderId: order.id,
        symbol: order.symbol,
        message: `Rejected order detected.`
      });
    }

    if (!symbolExposure[order.symbol]) {
      symbolExposure[order.symbol] = 0;
    }

    symbolExposure[order.symbol] += qty;
  }

  Object.entries(symbolExposure).forEach(
    ([symbol, exposure]) => {
      if (exposure > 10000) {
        alerts.push({
          severity: "HIGH",
          type: "CONCENTRATION_RISK",
          symbol,
          message: `High concentration exposure in ${symbol}.`
        });
      }
    }
  );

  const recentOrders = orders.filter((o) => {
    const age =
      Date.now() - new Date(o.createdAt).getTime();

    return age < 60 * 1000;
  });

  if (recentOrders.length > 15) {
    alerts.push({
      severity: "MEDIUM",
      type: "RAPID_ORDER_ACTIVITY",
      message:
        "High order activity detected in last 60 seconds."
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      severity: "INFO",
      type: "COMPLIANT",
      message: "No compliance breaches detected."
    });
  }

  return {
    totalAlerts: alerts.length,
    alerts
  };
}