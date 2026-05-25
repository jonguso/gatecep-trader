const userWatchlists = new Map();

const DEFAULT_WATCHLIST = [
  "SCOM",
  "KCB",
  "EQTY",
  "BAT"
];

function normalizeSymbol(symbol) {
  return String(symbol || "")
    .trim()
    .toUpperCase();
}

export function getWatchlist(userId = "demo-user") {
  if (!userWatchlists.has(userId)) {
    userWatchlists.set(userId, [...DEFAULT_WATCHLIST]);
  }

  return userWatchlists.get(userId);
}

export function addToWatchlist({
  userId = "demo-user",
  symbol
}) {
  const normalized = normalizeSymbol(symbol);

  if (!normalized) {
    throw new Error("Symbol is required");
  }

  const watchlist = getWatchlist(userId);

  if (!watchlist.includes(normalized)) {
    watchlist.push(normalized);
  }

  return watchlist;
}

export function removeFromWatchlist({
  userId = "demo-user",
  symbol
}) {
  const normalized = normalizeSymbol(symbol);

  const watchlist = getWatchlist(userId).filter(
    (item) => item !== normalized
  );

  userWatchlists.set(userId, watchlist);

  return watchlist;
}