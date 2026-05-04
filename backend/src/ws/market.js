import { marketDataGateway } from "../services/marketData/MarketDataGateway.js";

export function broadcast(type, data) {
  const msg = JSON.stringify({ type, data });
  global.clients.forEach(c => c.send(msg));
}

export function startMarketFeed() {
  setInterval(async () => {
    try {
      const result = await marketDataGateway.getPrices();
      const prices = Object.fromEntries((result.data || []).map(x => [x.symbol, x.price]));
      broadcast("price", { prices, provider: result.provider, delayed: result.delayed });
    } catch {
      // keep websocket alive
    }
  }, 3000);
}
