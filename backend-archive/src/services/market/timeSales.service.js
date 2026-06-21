const trades = [];

export function recordTrade({
  orderId,
  symbol,
  side,
  quantity,
  price,
  broker
}) {
  const trade = {
    id: `TRD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    orderId,
    symbol,
    side,
    quantity: Number(quantity || 0),
    price: Number(price || 0),
    broker,
    value: Number((Number(quantity || 0) * Number(price || 0)).toFixed(2)),
    executedAt: new Date().toISOString()
  };

  trades.unshift(trade);

  if (trades.length > 200) {
    trades.pop();
  }

  return trade;
}

export function getTimeSales({
  symbol
} = {}) {
  if (symbol) {
    return trades.filter(
      (trade) => trade.symbol === symbol
    );
  }

  return trades;
}