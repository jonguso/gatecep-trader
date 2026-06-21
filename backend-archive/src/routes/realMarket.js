import { marketDataProvider } from "../market-data/marketDataFactory.js";

export async function getLiveMarket(req, res) {
  try {
    const data = await marketDataProvider.getQuotes();
    res.json({
      provider: process.env.NSE_DATA_MODE || "demo",
      generatedAt: new Date().toISOString(),
      data
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}

export async function getMarketDepth(req, res) {
  try {
    const depth = await marketDataProvider.getDepth(String(req.params.symbol).toUpperCase());
    res.json(depth);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}

export async function getRankings(req, res) {
  try {
    const rows = await marketDataProvider.getQuotes();

    const normalized = rows.map(x => {
      const price = Number(x.price || x.lastPrice || 0);
      const volume = Number(x.volume || x.tradedVolume || 0);
      const turnover = Number(x.turnover || price * volume);
      const prevClose = Number(x.prevClose || x.previousClose || price);
      const changePct =
        x.changePct != null
          ? Number(x.changePct)
          : prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

      const hotScore = (turnover / 1000000) * 0.65 + Math.max(0, changePct) * 0.35;

      return {
        ...x,
        price,
        volume,
        turnover,
        changePct: Number(changePct.toFixed(2)),
        hotScore: Number(hotScore.toFixed(2)),
        isHot: hotScore >= 3 || (changePct > 1 && turnover > 500000)
      };
    });

    res.json({
      generatedAt: new Date().toISOString(),
      gainers: normalized.filter(x => x.changePct > 0).sort((a, b) => b.changePct - a.changePct).slice(0, 10),
      losers: normalized.filter(x => x.changePct < 0).sort((a, b) => a.changePct - b.changePct).slice(0, 5),
      movers: normalized.sort((a, b) => b.turnover - a.turnover).slice(0, 5),
      hot: normalized.filter(x => x.isHot).sort((a, b) => b.hotScore - a.hotScore).slice(0, 10)
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
