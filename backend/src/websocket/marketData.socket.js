import { generateMarketTick } from "../services/marketData/liveMarketData.service.js";

export function initMarketDataSocket(io) {
  setInterval(() => {
    const ticks = generateMarketTick();

    io.emit("market:tick", ticks);
  }, 2000);
}