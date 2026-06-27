let ioRef = null;

export function registerLivePortfolioSocket(io) {
  ioRef = io;
  console.log("Live portfolio socket registered.");
}

export function emitPortfolioUpdate(payload = {}) {
  if (!ioRef) return;

  ioRef.emit("portfolio:update", {
    ok: true,
    ...payload,
    emittedAt: new Date().toISOString()
  });
}