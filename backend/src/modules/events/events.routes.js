import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import {
  generatePortfolioEvents,
  getUserEvents,
  markEventAcknowledged
} from "./events.service.js";

const router = express.Router();

router.get("/portfolio", authRequired, async (req, res) => {
  try {
    const result = await generatePortfolioEvents(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/", authRequired, async (req, res) => {
  try {
    const result = await getUserEvents(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.patch("/:eventId/acknowledge", authRequired, async (req, res) => {
  try {
    const result = await markEventAcknowledged(
      req.user.id,
      req.params.eventId
    );

    res.json(result);
  } catch (error) {
    res.status(404).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;