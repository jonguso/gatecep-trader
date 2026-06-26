import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import { processPortfolioEvents } from "../../services/domain/events/EventEngine.js";

const router = express.Router();

router.get("/portfolio", authRequired, async (req, res) => {
  try {
    const result = await processPortfolioEvents(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;