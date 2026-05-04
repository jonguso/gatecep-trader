import { marketDataGateway } from "../services/marketData/MarketDataGateway.js";
import { buildRankings } from "../services/marketData/rankings.js";

export async function getMarketRankings(req, res) {
  try {
    const prices = await marketDataGateway.getPrices();
    const rankings = buildRankings(prices.data || []);

    res.json({
      provider: prices.provider,
      delayed: prices.delayed,
      disclaimer: prices.disclaimer,
      ...rankings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
