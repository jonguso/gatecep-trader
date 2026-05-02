import { refreshPublicDelayedPrices, latestPrices, priceMeta } from "../services/publicMarketData.js";
export { latestPrices };

export function broadcast(type, data) {
  const msg = JSON.stringify({ type, data });
  global.clients.forEach(c => c.send(msg));
}

export function startMarketFeed() {
  setInterval(async () => {
    await refreshPublicDelayedPrices();
    broadcast("price", { prices: latestPrices, meta: priceMeta });
  }, 3000);
}
