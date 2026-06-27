import express from "express";
import {
  getCachedQuote,
  getMarketCache,
  getMarketCacheStatus,
  refreshMarketCache
} from "./marketCache.service.js";
import {
  getMarketCacheSchedulerStatus,
  startMarketCacheScheduler,
  stopMarketCacheScheduler
} from "./marketCache.scheduler.js";

const router = express.Router();

router.get("/status", (req, res) => {
  res.json(getMarketCacheStatus());
});

router.get("/prices", (req, res) => {
  res.json({
    ok: true,
    ...getMarketCache()
  });
});

router.get("/quote/:symbol", (req, res) => {
  const quote = getCachedQuote(req.params.symbol);

  if (!quote) {
    return res.status(404).json({
      ok: false,
      error: "Quote not found"
    });
  }

  res.json({
    ok: true,
    quote
  });
});

router.post("/refresh", async (req, res) => {
  try {
    const result = await refreshMarketCache();

    res.json({
      ok: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/scheduler/status", (req, res) => {
  res.json(getMarketCacheSchedulerStatus());
});

router.post("/scheduler/start", (req, res) => {
  res.json(startMarketCacheScheduler());
});

router.post("/scheduler/stop", (req, res) => {
  res.json(stopMarketCacheScheduler());
});

export default router;