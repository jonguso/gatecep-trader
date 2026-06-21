import { getOrderBook } from "../market/orderBook.service.js";

export function getExecutionAdvice(symbol = "SCOM") {
  const book = getOrderBook(symbol);

  const spreadRisk =
    book.spread > 0.05 ? "HIGH" : "LOW";

  const liquidityRisk =
    book.liquidityScore < 40 ? "LOW_LIQUIDITY" : "NORMAL";

  const marketImpact =
    book.marketImpactEstimate > 0.3
      ? "HIGH_IMPACT"
      : "LOW_IMPACT";

  let recommendedBroker = "ABC";

  if (book.liquidityScore >= 60) {
    recommendedBroker = "AIB";
  }

  const confidenceScore = Math.max(
    50,
    Math.min(
      99,
      Math.round(
        100 -
          book.marketImpactEstimate * 100 -
          book.spread * 10
      )
    )
  );

  let recommendation = "EXECUTE_NOW";

  if (
    spreadRisk === "HIGH" ||
    marketImpact === "HIGH_IMPACT"
  ) {
    recommendation = "WAIT_FOR_LIQUIDITY";
  }

  return {
    symbol,
    spreadRisk,
    liquidityRisk,
    marketImpact,
    confidenceScore,
    recommendation,
    recommendedBroker,
    bestBid: book.bestBid,
    bestAsk: book.bestAsk,
    spread: book.spread,
    liquidityScore: book.liquidityScore
  };
}