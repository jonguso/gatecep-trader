import { getPortfolioSummary } from "../../services/domain/portfolio/PortfolioService.js";
import { calculatePortfolioPerformance } from "../../services/domain/performance/PerformanceService.js";
import { getCashSummary } from "../cash/cash.service.js";
import { getBrokerLinks } from "../broker-links/brokerLinks.service.js";
import { generateCoachDashboardInsights } from "../../services/domain/coach/CoachService.js";
import { generateIntelligentRecommendations } from "../../services/domain/coach/CoachIntelligenceService.js";
import { getNotifications } from "../notifications/notifications.service.js";
import { calculateDividendIntelligence } from "../dividends/dividend.service.js";

export async function getIntelligenceHome(userId) {
  const [portfolio, cashData, brokers, notificationResult] =
    await Promise.all([
      getPortfolioSummary(userId),
      getCashSummary(userId),
      getBrokerLinks(userId),
      getNotifications(userId)
    ]);

  const holdings = portfolio.holdings || [];
  const performance = calculatePortfolioPerformance(holdings);
  const dividends = calculateDividendIntelligence(holdings);

  const totalValue = Number(portfolio.totalValue || 0);
  const investedValue = Number(portfolio.investedValue || 0);
  const totalGain = Number(portfolio.totalGain || 0);
  const gainPct = Number(portfolio.gainPct || 0);

  const totalCash = Number(cashData?.summary?.totalCash || 0);
  const netWorth = totalValue + totalCash;

  const sectors = performance.allocation || [];
  const largestSector = sectors[0] || null;

  const largestHolding =
    [...(performance.holdings || [])].sort((a, b) => b.value - a.value)[0] ||
    null;

  const coachInsights = generateCoachDashboardInsights({
    holdings,
    brokers,
    largestHolding,
    largestSector,
    totalCash,
    netWorth,
    gainPct
  });

  const intelligence = generateIntelligentRecommendations({
    portfolio,
    performance,
    cashData,
    brokers
  });

  const dashboardCard = {
    status: intelligence.healthStatus?.status,
    label: intelligence.healthStatus?.label,
    tone: intelligence.healthStatus?.tone,
    headline: intelligence.primaryInsight?.title,
    summary: intelligence.coachNarrative,
    confidence: intelligence.healthStatus?.confidence,
    mainAction: intelligence.nextBestActions?.[0] || null,
    actions: intelligence.nextBestActions || []
  };

  return {
    ok: true,
    summary: {
      totalValue,
      investedValue,
      totalCash,
      netWorth,
      totalGain,
      gainPct,
      holdingsCount: holdings.length,
      brokersCount: brokers.length,
      cashWeight: coachInsights.cashWeight
    },
    dashboardCard,
    healthStatus: intelligence.healthStatus,
    primaryInsight: intelligence.primaryInsight,
    coachNarrative: intelligence.coachNarrative,
    nextBestActions: intelligence.nextBestActions || [],
    recommendations: intelligence.recommendations || [],
    notifications: {
  summary: notificationResult.summary,
  items: notificationResult.notifications || []
},
    dividends,


    sectors,
    largestSector,
    largestHolding,
    generatedAt: new Date().toISOString(),
    version: "IntelligenceHub-013B"
  };
}