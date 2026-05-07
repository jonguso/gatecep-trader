import { marketDataGateway } from "../services/marketData/MarketDataGateway.js";

export async function getMarketSnapshot(req, res) {
  try {
    const payload = await marketDataGateway.getPrices();
    const rows = payload.data || [];

    res.json({
      provider: payload.provider || "demo-nse-feed",
      generatedAt: new Date().toISOString(),
      count: rows.length,
      data: rows,
      rankings: {
        gainers: rows.filter(x => Number(x.changePct || 0) > 0).sort((a, b) => Number(b.changePct || 0) - Number(a.changePct || 0)).slice(0, 10),
        losers: rows.filter(x => Number(x.changePct || 0) < 0).sort((a, b) => Number(a.changePct || 0) - Number(b.changePct || 0)).slice(0, 5),
        movers: [...rows].sort((a, b) => Number(b.turnover || 0) - Number(a.turnover || 0)).slice(0, 5)
      }
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
