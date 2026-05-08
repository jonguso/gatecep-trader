const basePrices = {
  SCOM: 18.45,
  EQTY: 47.2,
  KCB: 31.8,
  COOP: 15.6
};

function randomQty() {
  return Math.floor(Math.random() * 5000) + 100;
}

function generateLevels(basePrice, side) {
  const levels = [];

  for (let i = 0; i < 5; i++) {
    const offset = (i + 1) * 0.01;

    const price =
      side === "BID"
        ? Number((basePrice - offset).toFixed(2))
        : Number((basePrice + offset).toFixed(2));

    levels.push({
      price,
      quantity: randomQty()
    });
  }

  return levels;
}

export function getOrderBook(symbol = "SCOM") {
  const basePrice =
    basePrices[symbol] || 20;

  const bids = generateLevels(basePrice, "BID");
  const asks = generateLevels(basePrice, "ASK");

  const bestBid = bids[0]?.price || 0;
  const bestAsk = asks[0]?.price || 0;

  const spread = Number(
    (bestAsk - bestBid).toFixed(2)
  );

  const totalBidLiquidity = bids.reduce(
    (sum, level) => sum + level.quantity,
    0
  );

  const totalAskLiquidity = asks.reduce(
    (sum, level) => sum + level.quantity,
    0
  );

  const liquidityScore = Math.min(
    100,
    Math.round(
      (totalBidLiquidity + totalAskLiquidity) / 500
    )
  );

  const marketImpactEstimate = Number(
    ((spread / basePrice) * 100).toFixed(2)
  );

  return {
    symbol,
    bestBid,
    bestAsk,
    spread,
    liquidityScore,
    marketImpactEstimate,
    bids,
    asks
  };
}