import { getExecutionAnalytics } from "../orders/executionAnalytics.service.js";
import { getBrokerHealthMetrics } from "../brokers/brokerHealth.service.js";
import { getOmsAlerts } from "../alerts/omsAlerts.service.js";
import { getComplianceAlerts } from "../compliance/compliance.service.js";
import { getPortfolio } from "../portfolio/portfolio.service.js";

export async function getAdminDashboard() {
  const analytics = await getExecutionAnalytics();

  const brokerHealth = await getBrokerHealthMetrics();

  const omsAlerts = await getOmsAlerts();

  const compliance = await getComplianceAlerts();

  const portfolio = await getPortfolio();

  return {
    systemStatus: "ONLINE",

    executionSummary: {
      totalOrders: analytics.totalOrders,
      fillRate: analytics.fillRate,
      rejectedOrders: analytics.rejectedOrders
    },

    brokerSummary: brokerHealth,

    omsAlerts,

    complianceSummary: {
      totalAlerts: compliance.totalAlerts
    },

    portfolioSummary: {
      marketValue: portfolio.totalMarketValue,
      unrealizedPnL: portfolio.totalUnrealizedPnL,
      buyingPower: portfolio.availableBuyingPower
    }
  };
}