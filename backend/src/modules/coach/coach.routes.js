import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import { getPortfolioSummary } from "../../services/domain/portfolio/PortfolioService.js";
import { calculatePortfolioPerformance } from "../../services/domain/performance/PerformanceService.js";
import { generateCoachDashboardInsights } from "../../services/domain/coach/CoachService.js";
import { generateIntelligentRecommendations } from "../../services/domain/coach/CoachIntelligenceService.js";
import { getCashSummary } from "../cash/cash.service.js";
import { getBrokerLinks } from "../broker-links/brokerLinks.service.js";

const router = express.Router();

router.get("/dashboard", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;

    const [portfolio, cashData, brokers] = await Promise.all([
      getPortfolioSummary(userId),
      getCashSummary(userId),
      getBrokerLinks(userId)
    ]);

    const holdings = portfolio.holdings || [];
    const performance = calculatePortfolioPerformance(holdings);

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

    res.json({
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
      largestSector,
      largestHolding,
      sectors,
           recommendations: coachInsights.recommendations,
      scores: coachInsights.scores,
      coachMessage: coachInsights.coachMessage,
      intelligence,
      dashboardCard: {
        status: intelligence.healthStatus?.status,
        label: intelligence.healthStatus?.label,
        tone: intelligence.healthStatus?.tone,
        headline: intelligence.primaryInsight?.title,
        summary: intelligence.coachNarrative,
        confidence: intelligence.healthStatus?.confidence,
        mainAction: intelligence.nextBestActions?.[0] || null,
        actions: intelligence.nextBestActions || []
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;