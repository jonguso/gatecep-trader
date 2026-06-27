let ioRef = null;

export function registerMarketCacheSocket(io) {
  ioRef = io;
  console.log("Market cache socket registered.");
}

export function emitMarketCacheUpdated(payload = {}) {
  if (!ioRef) return;

  ioRef.emit("market-cache:updated", {
    ok: true,
    ...payload,
    emittedAt: new Date().toISOString()
  });
}