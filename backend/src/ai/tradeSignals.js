function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
export function buildTradeRecommendation({ symbol, side="BUY", price, qty, market={}, balances={}, priceBand={}, duplicate=false }) {
  const orderValue = Number(price) * Number(qty);
  const changePct = Number(market.changePct || 0);
  const turnover = Number(market.turnover || 0);
  const momentum = clamp(50 + changePct * 8, 0, 100);
  const liquidity = turnover > 10000000 ? 90 : turnover > 1000000 ? 65 : 40;
  const priceRisk = priceBand.valid && (price < priceBand.minPrice || price > priceBand.maxPrice) ? 10 : 80;
  const exposure = balances.totalEquity ? clamp(90 - (orderValue / balances.totalEquity) * 200, 20, 90) : 70;
  let confidence = Math.round(momentum*.3 + liquidity*.25 + priceRisk*.25 + exposure*.2);
  const riskFlags = [];
  if (duplicate) { confidence -= 30; riskFlags.push("Duplicate order detected"); }
  if (priceRisk < 20) riskFlags.push("Price outside allowed broker range");
  confidence = clamp(confidence, 0, 99);
  const signal = confidence >= 75 ? side : confidence >= 60 ? "REVIEW" : "HOLD";
  return {
    symbol, side, signal, action: signal, confidence,
    recommendationText: `${confidence}% ${signal}: Coach G reviewed momentum, liquidity, price range, and exposure.`,
    scores: { momentum: Math.round(momentum), liquidity: Math.round(liquidity), priceRisk: Math.round(priceRisk), exposure: Math.round(exposure) },
    riskFlags,
    reasons: [`Session change ${changePct.toFixed(2)}%`, `Turnover KES ${Math.round(turnover).toLocaleString("en-KE")}`],
    allowAutoEnable: confidence >= 60 && !riskFlags.includes("Price outside allowed broker range") && !duplicate
  };
}
