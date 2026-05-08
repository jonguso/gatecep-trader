import express from "express";
import { buildUnifiedPortfolio } from "../services/portfolio/UnifiedPortfolioEngine.js";

export const unifiedPortfolioRouter = express.Router();

unifiedPortfolioRouter.get("/:userId", async (req, res) => {
  try {
    const payload = await buildUnifiedPortfolio(req.params.userId || "u1");
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
