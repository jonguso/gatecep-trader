import { generateMarketTick } from "../services/marketData/liveMarketData.service.js";

import {
  updateCandlesFromPrice,
  candleStore
} from "../routes/candles.js";

export function initMarketDataSocket(io) {
  setInterval(() => {

    const ticks = generateMarketTick();

    io.emit("market:tick", ticks);

    ticks.forEach((item) => {

      updateCandlesFromPrice(
        item.symbol,
        item.price
      );

      io.emit(
        "candles:update",
        {
          symbol: item.symbol,
          candles: candleStore[item.symbol]
        }
      );

    });

  }, 3000);
}