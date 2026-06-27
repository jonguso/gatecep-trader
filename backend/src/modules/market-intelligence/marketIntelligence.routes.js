import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import { getMarketIntelligenceHome } from "./marketIntelligence.service.js";

const router = express.Router();

router.get("/home", authRequired, async (req, res) => {
  try {
    const result = await getMarketIntelligenceHome(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;