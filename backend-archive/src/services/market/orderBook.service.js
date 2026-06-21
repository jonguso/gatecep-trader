const orderBooks = {};

function ensureBook(symbol) {
  if (!orderBooks[symbol]) {
    orderBooks[symbol] = {
      bids: [],
      asks: []
    };
  }

  return orderBooks[symbol];
}

export function addOrderToBook({
  symbol,
  side,
  quantity,
  price,
  orderId
}) {
  const book = ensureBook(symbol);

  const level = {
    orderId,
    quantity: Number(quantity),
    price: Number(price),
    createdAt: new Date().toISOString()
  };

  if (side === "BUY") {
    book.bids.push(level);

    book.bids.sort(
      (a, b) => b.price - a.price
    );
  } else {
    book.asks.push(level);

    book.asks.sort(
      (a, b) => a.price - b.price
    );
  }

  return book;
}

export function getOrderBook(symbol) {
  return ensureBook(symbol);
}

export function removeOrderFromBook({
  symbol,
  side,
  orderId
}) {
  const book = ensureBook(symbol);

  if (side === "BUY") {
    book.bids = book.bids.filter(
      (x) => x.orderId !== orderId
    );
  } else {
    book.asks = book.asks.filter(
      (x) => x.orderId !== orderId
    );
  }

  return book;
}

export function matchOrderBook(symbol) {
  const book = ensureBook(symbol);

  if (
    !book.bids.length ||
    !book.asks.length
  ) {
    return null;
  }

  const bestBid = book.bids[0];
  const bestAsk = book.asks[0];

  if (bestBid.price < bestAsk.price) {
    return null;
  }

  const matchedQty = Math.min(
    bestBid.quantity,
    bestAsk.quantity
  );

  const tradePrice = bestAsk.price;

  bestBid.quantity -= matchedQty;
  bestAsk.quantity -= matchedQty;

  if (bestBid.quantity <= 0) {
    book.bids.shift();
  }

  if (bestAsk.quantity <= 0) {
    book.asks.shift();
  }

  return {
    symbol,
    quantity: matchedQty,
    price: tradePrice,
    buyOrderId: bestBid.orderId,
    sellOrderId: bestAsk.orderId,
    executedAt: new Date().toISOString()
  };
}