import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import { getIntelligenceHome } from "./intelligence.service.js";

const router = express.Router();

router.get("/home", authRequired, async (req, res) => {
  try {
    const result = await getIntelligenceHome(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;