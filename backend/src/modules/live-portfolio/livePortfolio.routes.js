import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import { broadcastPortfolioUpdateForUser } from "./livePortfolio.service.js";

const router = express.Router();

router.post("/broadcast", authRequired, async (req, res) => {
  try {
    const result = await broadcastPortfolioUpdateForUser(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;