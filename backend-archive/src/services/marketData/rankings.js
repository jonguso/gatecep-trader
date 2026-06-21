function number(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeRow(row, index = 0) {
  const lastPrice = number(row.lastPrice ?? row.price ?? row.close ?? row.currentPrice, 0);
  const prevClose = number(row.prevClose ?? row.previousClose ?? row.yesterdayClose ?? row.open ?? lastPrice, lastPrice);
  const volume = number(row.volume ?? row.tradedVolume ?? row.sharesTraded, 0);

  // If no real feed volume exists, keep fallback explicit and flagged.
  const fallbackVolume = volume || ((index + 1) * 5000);
  const changePct =
    row.changePct != null
      ? number(row.changePct)
      : prevClose > 0
      ? ((lastPrice - prevClose) / prevClose) * 100
      : 0;

  const turnover =
    row.turnover != null
      ? number(row.turnover)
      : lastPrice * fallbackVolume;

  const liquidityScore = turnover / 1000000;
  const momentumScore = Math.max(0, changePct);
  const hotScore = Number((liquidityScore * 0.65 + momentumScore * 0.35).toFixed(2));

  return {
    ...row,
    price: lastPrice,
    lastPrice,
    prevClose,
    changePct: Number(changePct.toFixed(2)),
    volume: fallbackVolume,
    turnover: Number(turnover.toFixed(2)),
    hotScore,
    isHot: hotScore >= 3 || (changePct > 1 && turnover > 500000),
    dataQuality: {
      hasRealVolume: !!volume,
      hasPrevClose: !!(row.prevClose ?? row.previousClose ?? row.yesterdayClose),
      hasTurnover: row.turnover != null
    }
  };
}

export function buildRankings(marketRows = []) {
  const rows = marketRows.map(normalizeRow);

  const gainers = rows
    .filter(x => x.changePct > 0)
    .sort((a, b) => b.changePct - a.changePct)
    .slice(0, 10);

  const losers = rows
    .filter(x => x.changePct < 0)
    .sort((a, b) => a.changePct - b.changePct)
    .slice(0, 5);

  const movers = rows
    .slice()
    .sort((a, b) => b.turnover - a.turnover)
    .slice(0, 5);

  const hot = rows
    .filter(x => x.isHot)
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, 10);

  return {
    generatedAt: new Date().toISOString(),
    methodology: {
      gainers: "Top 10 positive percentage change using (lastPrice - prevClose) / prevClose.",
      losers: "Top 5 negative percentage change using (lastPrice - prevClose) / prevClose.",
      movers: "Top 5 by turnover using lastPrice * volume, or feed-provided turnover.",
      hot: "Coach G hot score blends turnover/liquidity and positive momentum."
    },
    gainers,
    losers,
    movers,
    hot
  };
}
