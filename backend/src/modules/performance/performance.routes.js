import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import { getPortfolioSummary } from "../../services/domain/portfolio/PortfolioService.js";
import { calculatePortfolioPerformance } from "../../services/domain/performance/PerformanceService.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  try {
    const portfolio = await getPortfolioSummary(req.user.id);
    const performance = calculatePortfolioPerformance(portfolio.holdings || []);

    res.json({
      ok: true,
      currentValue: portfolio.totalValue,
      investedValue: portfolio.investedValue,
      realizedGain: 0,
      unrealizedGain: portfolio.totalGain,
      unrealizedGainPct: portfolio.gainPct,
      totalReturn: portfolio.totalGain,
      totalReturnPct: portfolio.gainPct,
      allocation: performance.allocation || [],
      topGainers: performance.topGainers || [],
      topLosers: performance.topLosers || [],
      bestHolding: performance.bestHolding || null,
      worstHolding: performance.worstHolding || null
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;