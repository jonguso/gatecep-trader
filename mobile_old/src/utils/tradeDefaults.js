export function format2(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export function cleanQty(value) {
  const n = Math.floor(Number(value || 0));
  return String(Math.max(1, n));
}

export function normalizePriceInput(value) {
  const clean = String(value || "").replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
  const parts = clean.split(".");
  if (parts.length === 1) return parts[0];
  return `${parts[0]}.${parts[1].slice(0, 2)}`;
}

export function normalizeQtyInput(value) {
  return String(value || "").replace(/[^0-9]/g, "");
}

export function makeDepth(price = 15) {
  const p = Number(price || 15);
  const step = p < 20 ? 0.05 : p < 100 ? 0.25 : 1;
  return {
    bids: [
      { qty: 9596, price: +(p - step).toFixed(2) },
      { qty: 947, price: +(p - step * 2).toFixed(2) },
      { qty: 2756, price: +(p - step * 3).toFixed(2) },
      { qty: 2295, price: +(p - step * 4).toFixed(2) }
    ],
    asks: [
      { price: +p.toFixed(2), qty: 5878 },
      { price: +(p + step).toFixed(2), qty: 8931 },
      { price: +(p + step * 2).toFixed(2), qty: 10500 },
      { price: +(p + step * 3).toFixed(2), qty: 205 }
    ]
  };
}

export function getDepth(market) {
  return market?.depth || makeDepth(market?.price || market?.lastPrice || 0);
}

export function getBestOffer(market) {
  const ask = getDepth(market).asks?.[0];
  return {
    price: Number(ask?.price || market?.offerPrice || market?.price || 0),
    qty: Number(ask?.qty || market?.offerQty || 100)
  };
}

export function getBestBid(market) {
  const bid = getDepth(market).bids?.[0];
  return {
    price: Number(bid?.price || market?.bidPrice || market?.price || 0),
    qty: Number(bid?.qty || market?.bidQty || 100)
  };
}
