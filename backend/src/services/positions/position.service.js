const positions = new Map();

export function updatePositionFromFill({
  symbol,
  side,
  quantity,
  price,
  broker
}) {
  const key = `${broker}:${symbol}`;

  const existing =
    positions.get(key) || {
      symbol,
      broker,
      quantity: 0,
      averageCost: 0,
      realizedPnL: 0,
      updatedAt: new Date().toISOString()
    };

  if (side === "BUY") {
    const oldValue =
      existing.quantity * existing.averageCost;

    const buyValue =
      quantity * price;

    const newQuantity =
      existing.quantity + quantity;

    existing.averageCost =
      newQuantity > 0
        ? Number(((oldValue + buyValue) / newQuantity).toFixed(2))
        : 0;

    existing.quantity = newQuantity;
  }

  if (side === "SELL") {
    const sellQuantity =
      Math.min(existing.quantity, quantity);

    const realized =
      (price - existing.averageCost) * sellQuantity;

    existing.realizedPnL =
      Number((existing.realizedPnL + realized).toFixed(2));

    existing.quantity =
      Math.max(existing.quantity - sellQuantity, 0);
  }

  existing.updatedAt = new Date().toISOString();

  positions.set(key, existing);

  return existing;
}

export function getPositions() {
  return Array.from(positions.values());
}

export function getPositionBySymbol(symbol) {
  return getPositions().filter(
    (position) => position.symbol === symbol
  );
}