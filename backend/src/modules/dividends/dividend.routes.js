import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import { getPortfolioSummary } from "../../services/domain/portfolio/PortfolioService.js";
import { calculateDividendIntelligence } from "./dividend.service.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  try {
    const portfolio = await getPortfolioSummary(req.user.id);
    const dividends = calculateDividendIntelligence(portfolio.holdings || []);

    res.json({
      ok: true,
      dividends
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;