import express from "express";

import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
} from "../services/watchlist/watchlist.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const userId = req.query.userId || "demo-user";

    return res.json({
      ok: true,
      watchlist: getWatchlist(userId)
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/", (req, res) => {
  try {
    const watchlist = addToWatchlist({
      userId: req.body.userId || "demo-user",
      symbol: req.body.symbol
    });

    return res.json({
      ok: true,
      watchlist
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

router.delete("/:symbol", (req, res) => {
  try {
    const watchlist = removeFromWatchlist({
      userId: req.query.userId || "demo-user",
      symbol: req.params.symbol
    });

    return res.json({
      ok: true,
      watchlist
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;