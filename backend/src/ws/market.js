import { refreshPrices, latestPrices } from "../services/marketData.js";
import { updateCandlesFromPrice } from "../routes/candles.js";

export { latestPrices };

export function broadcast(type, data) {
  const msg = JSON.stringify({ type, data });
  global.clients.forEach(c => c.send(msg));
}

export function startMarketFeed() {
  setInterval(async () => {
    await refreshPrices();
    for (const [symbol, price] of Object.entries(latestPrices)) updateCandlesFromPrice(symbol, price);
    broadcast("price", { prices: latestPrices });
  }, 3000);
}
