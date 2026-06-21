import { getOrderBook } from "../market/orderBook.service.js";

export function splitOrder({
  symbol = "SCOM",
  quantity = 1000
}) {
  const book = getOrderBook(symbol);

  const liquidity = Math.max(
    1,
    book.liquidityScore
  );

  let childOrderSize = 100;

  if (liquidity >= 70) {
    childOrderSize = 500;
  } else if (liquidity >= 40) {
    childOrderSize = 250;
  }

  const childOrders = [];

  let remaining = quantity;
  let sequence = 1;

  while (remaining > 0) {
    const size = Math.min(
      childOrderSize,
      remaining
    );

    childOrders.push({
      childId: `${symbol}-CHILD-${sequence}`,
      quantity: size,
      executionWindowSeconds: sequence * 30
    });

    remaining -= size;
    sequence++;
  }

  const estimatedMarketImpact = Number(
    (
      (quantity / (liquidity * 1000)) *
      100
    ).toFixed(2)
  );

  let executionStyle = "PASSIVE";

  if (estimatedMarketImpact > 5) {
    executionStyle = "ICEBERG";
  }

  return {
    symbol,
    parentQuantity: quantity,
    liquidityScore: liquidity,
    estimatedMarketImpact,
    executionStyle,
    recommendedBroker:
      liquidity >= 60 ? "AIB" : "ABC",
    childOrderCount: childOrders.length,
    childOrders
  };
}