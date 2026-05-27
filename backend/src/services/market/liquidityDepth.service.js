const books = {
  SCOM: {
    bids: [
      { price: 30.1, quantity: 5000 },
      { price: 30.05, quantity: 12000 },
      { price: 30.0, quantity: 18000 }
    ],
    asks: [
      { price: 30.2, quantity: 3000 },
      { price: 30.25, quantity: 8000 },
      { price: 30.3, quantity: 15000 }
    ]
  },

  EQTY: {
    bids: [
      { price: 75.0, quantity: 4000 },
      { price: 74.75, quantity: 10000 },
      { price: 74.5, quantity: 16000 }
    ],
    asks: [
      { price: 75.2, quantity: 3500 },
      { price: 75.5, quantity: 9000 },
      { price: 76.0, quantity: 14000 }
    ]
  },

  KCB: {
    bids: [
      { price: 66.5, quantity: 3000 },
      { price: 66.25, quantity: 9000 },
      { price: 66.0, quantity: 14000 }
    ],
    asks: [
      { price: 66.8, quantity: 2500 },
      { price: 67.0, quantity: 7000 },
      { price: 67.25, quantity: 12000 }
    ]
  }
};

function cloneBook(book) {
  return {
    bids: book.bids.map((row) => ({ ...row })),
    asks: book.asks.map((row) => ({ ...row }))
  };
}

export function getLiquidityDepth(symbol) {
  const book =
    books[String(symbol || "").trim()] || {
      bids: [],
      asks: []
    };

  return cloneBook(book);
}

export function simulateDepthFill({
  symbol,
  side,
  quantity,
  limitPrice
}) {
  const book =
    books[String(symbol || "").trim()];

  if (!book) {
    return {
      filledQuantity: 0,
      averagePrice: 0,
      remainingQuantity: Number(quantity || 0),
      slippagePct: 0,
      fills: [],
      book: {
        bids: [],
        asks: []
      }
    };
  }

  const requestedQuantity = Number(quantity || 0);
  let remaining = requestedQuantity;

  const fills = [];

  const levels =
    side === "BUY" ? book.asks : book.bids;

  const canTrade = (levelPrice) => {
    if (!limitPrice || Number(limitPrice) <= 0) {
      return true;
    }

    if (side === "BUY") {
      return levelPrice <= Number(limitPrice);
    }

    return levelPrice >= Number(limitPrice);
  };

  for (const level of levels) {
    if (remaining <= 0) break;

    if (!canTrade(level.price)) {
      continue;
    }

    const fillQty = Math.min(
      remaining,
      Number(level.quantity || 0)
    );

    if (fillQty <= 0) continue;

    fills.push({
      price: level.price,
      quantity: fillQty
    });

    level.quantity -= fillQty;
    remaining -= fillQty;
  }

  const filledQuantity =
    requestedQuantity - remaining;

  const tradedValue = fills.reduce(
    (sum, fill) =>
      sum + fill.quantity * fill.price,
    0
  );

  const averagePrice =
    filledQuantity > 0
      ? Number(
          (tradedValue / filledQuantity).toFixed(2)
        )
      : 0;

  const referencePrice =
    Number(limitPrice || averagePrice || 0);

  const slippagePct =
    referencePrice > 0 && averagePrice > 0
      ? Number(
          (
            ((averagePrice - referencePrice) /
              referencePrice) *
            100 *
            (side === "BUY" ? 1 : -1)
          ).toFixed(2)
        )
      : 0;

  return {
    filledQuantity,
    averagePrice,
    remainingQuantity: remaining,
    slippagePct,
    fills,
    book: cloneBook(book)
  };
}