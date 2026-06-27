import { getMarketIntelligenceHome } from "../market-intelligence/marketIntelligence.service.js";
import { emitPortfolioUpdate } from "./livePortfolio.socket.js";
import { getActiveUserIds } from "./livePortfolio.registry.js";

export async function broadcastPortfolioUpdateForUser(userId) {
  const intelligence = await getMarketIntelligenceHome(userId);

  emitPortfolioUpdate({
    userId,
    summary: intelligence.summary,
    coach: intelligence.coach,
    movers: intelligence.movers,
    holdings: intelligence.holdings,
    marketFeed: intelligence.marketFeed,
    generatedAt: intelligence.generatedAt,
    version: "LivePortfolio-020A"
  });

  return {
    ok: true,
    userId,
    summary: intelligence.summary,
    emittedAt: new Date().toISOString()
  };
}

export async function broadcastPortfolioUpdatesForActiveUsers() {
  const userIds = getActiveUserIds();

  const results = [];

  for (const userId of userIds) {
    try {
      const result = await broadcastPortfolioUpdateForUser(userId);
      results.push(result);
    } catch (error) {
      results.push({
        ok: false,
        userId,
        error: error.message
      });
    }
  }

  return {
    ok: true,
    activeUsers: userIds.length,
    results,
    emittedAt: new Date().toISOString(),
    version: "LivePortfolio-020B"
  };
}