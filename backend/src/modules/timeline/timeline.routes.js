import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import { getWealthTimeline } from "./timeline.service.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  try {
    const result = await getWealthTimeline(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;