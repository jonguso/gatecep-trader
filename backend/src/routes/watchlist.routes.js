import express from "express";

import {
  getWatchlist
} from "../services/watchlist/watchlist.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const watchlist =
      getWatchlist();

    res.json({
      ok: true,
      watchlist
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;