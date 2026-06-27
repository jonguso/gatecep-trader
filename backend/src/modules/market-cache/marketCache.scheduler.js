import { refreshMarketCache } from "./marketCache.service.js";
import { emitMarketCacheUpdated } from "./marketCache.socket.js";
import { broadcastPortfolioUpdatesForActiveUsers } from "../live-portfolio/livePortfolio.service.js";

let refreshTimer = null;

function getRefreshIntervalMs() {
  return Number(process.env.MARKET_CACHE_REFRESH_MS || 30000);
}

export function startMarketCacheScheduler() {
  if (refreshTimer) {
    return {
      ok: true,
      running: true,
      intervalMs: getRefreshIntervalMs(),
      message: "Market cache scheduler already running."
    };
  }

  const intervalMs = getRefreshIntervalMs();

  refreshMarketCache()
    .then((result) => {
      console.log(
        `Market cache initial refresh: ${result.count} quotes from ${result.provider}`
      );

      emitMarketCacheUpdated({
        provider: result.provider,
        marketDate: result.marketDate,
        generatedAt: result.generatedAt,
        count: result.count
      });
broadcastPortfolioUpdatesForActiveUsers().catch((error) => {
  console.log("Live portfolio broadcast failed:", error.message);
});

    })
    .catch((error) => {
      console.log("Market cache initial refresh failed:", error.message);
    });

  refreshTimer = setInterval(async () => {
    try {
      const result = await refreshMarketCache();

      console.log(
        `Market cache refreshed: ${result.count} quotes from ${result.provider}`
      );

      emitMarketCacheUpdated({
        provider: result.provider,
        marketDate: result.marketDate,
        generatedAt: result.generatedAt,
        count: result.count
      });
broadcastPortfolioUpdatesForActiveUsers().catch((error) => {
  console.log("Live portfolio broadcast failed:", error.message);
});
    } catch (error) {
      console.log("Market cache refresh failed:", error.message);
    }
  }, intervalMs);

  return {
    ok: true,
    running: true,
    intervalMs,
    version: "MarketCacheScheduler-019D"
  };
}

export function stopMarketCacheScheduler() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }

  return {
    ok: true,
    running: false,
    intervalMs: getRefreshIntervalMs(),
    version: "MarketCacheScheduler-019D"
  };
}

export function getMarketCacheSchedulerStatus() {
  return {
    ok: true,
    running: Boolean(refreshTimer),
    intervalMs: getRefreshIntervalMs(),
    version: "MarketCacheScheduler-019D"
  };
}