const orderBooks = {
  SCOM: {
    bids: [
      { price: 18.4, quantity: 12000 },
      { price: 18.35, quantity: 9000 },
      { price: 18.3, quantity: 7000 }
    ],
    asks: [
      { price: 18.45, quantity: 9500 },
      { price: 18.5, quantity: 14000 },
      { price: 18.55, quantity: 10000 }
    ]
  },
  KCB: {
    bids: [
      { price: 66.6, quantity: 5000 },
      { price: 66.4, quantity: 4000 }
    ],
    asks: [
      { price: 66.8, quantity: 4500 },
      { price: 67.0, quantity: 6000 }
    ]
  }
};

function getBook(symbol) {
  if (!orderBooks[symbol]) {
    orderBooks[symbol] = {
      bids: [
        { price: 100, quantity: 5000 },
        { price: 99.5, quantity: 3000 }
      ],
      asks: [
        { price: 100.5, quantity: 5000 },
        { price: 101, quantity: 3000 }
      ]
    };
  }

  return orderBooks[symbol];
}

export function getOrderBook(symbol) {
  return getBook(symbol);
}

export function matchOrder({
  symbol,
  side,
  quantity,
  limitPrice
}) {
  const book = getBook(symbol);
  let remaining = Number(quantity || 0);
  const fills = [];

  const levels =
    side === "BUY" ? book.asks : book.bids;

  for (const level of levels) {
    if (remaining <= 0) break;

    const priceMatch =
      side === "BUY"
        ? level.price <= limitPrice
        : level.price >= limitPrice;

    if (!priceMatch) continue;

    const fillQty = Math.min(
      remaining,
      level.quantity
    );

    fills.push({
      price: level.price,
      quantity: fillQty
    });

    level.quantity -= fillQty;
    remaining -= fillQty;
  }

  const filledQuantity =
    fills.reduce((sum, fill) => sum + fill.quantity, 0);

  const notional =
    fills.reduce(
      (sum, fill) => sum + fill.quantity * fill.price,
      0
    );

  const averagePrice =
    filledQuantity > 0
      ? Number((notional / filledQuantity).toFixed(2))
      : 0;

  const status =
    remaining === 0
      ? "FILLED"
      : filledQuantity > 0
      ? "PARTIAL_FILL"
      : "REJECTED";

  return {
    symbol,
    side,
    requestedQuantity: quantity,
    filledQuantity,
    remainingQuantity: remaining,
    averagePrice,
    status,
    fills,
    book
  };
}