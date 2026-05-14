export function calculateExecutionQuality(order) {
  const requestedQty =
    Number(order.quantity || 0);

  const filledQty =
    Number(order.filledQuantity || 0);

  const limitPrice =
    Number(order.price || 0);

  const avgFillPrice =
    Number(order.averageFillPrice || 0);

  const fillRate =
    requestedQty > 0
      ? (filledQty / requestedQty) * 100
      : 0;

  const slippage =
    limitPrice > 0 && avgFillPrice > 0
      ? order.side === "BUY"
        ? ((avgFillPrice - limitPrice) / limitPrice) * 100
        : ((limitPrice - avgFillPrice) / limitPrice) * 100
      : 0;

  const eventCount =
    order.executionEvents?.length || 0;

  const rejected =
    order.status === "REJECTED";

  let score = 100;

  score -= Math.max(0, slippage) * 25;

  if (fillRate < 100) {
    score -= (100 - fillRate) * 0.7;
  }

  if (eventCount > 6) {
    score -= 5;
  }

  if (rejected) {
    score = 0;
  }

  score = Math.max(
    0,
    Math.min(100, Number(score.toFixed(2)))
  );

  let grade = "A";

  if (score < 90) grade = "B";
  if (score < 75) grade = "C";
  if (score < 60) grade = "D";
  if (score < 40) grade = "F";

  return {
    orderId: order.id,
    symbol: order.symbol,
    side: order.side,
    broker: order.broker,
    score,
    grade,
    fillRate: Number(fillRate.toFixed(2)),
    slippagePct: Number(slippage.toFixed(4)),
    averageFillPrice: avgFillPrice,
    limitPrice,
    filledQuantity: filledQty,
    requestedQuantity: requestedQty,
    status: order.status,
    eventCount,
    generatedAt: new Date().toISOString()
  };
}