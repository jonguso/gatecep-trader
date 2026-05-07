import { NSE_SECURITY_MASTER } from "../../data/nseSecurityMaster.js";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function round2(value) {
  return Number(Number(value || 0).toFixed(2));
}

function priceFor(symbol) {
  const seed = String(symbol)
    .split("")
    .reduce((sum, c) => sum + c.charCodeAt(0), 0);

  return round2(5 + (seed % 580) + rand(-2, 2));
}

class MarketDataGateway {
  async getPrices() {
    const data = NSE_SECURITY_MASTER.map((security) => {
      const price = priceFor(security.symbol);
      const changePct = round2(rand(-4, 4));
      const prevClose = price / (1 + changePct / 100);
      const volume = Math.floor(rand(10000, 8000000));

      return {
        ...security,
        price,
        lastPrice: price,
        open: round2(prevClose * 1.01),
        high: round2(price * 1.03),
        low: round2(price * 0.97),
        prevClose: round2(prevClose),
        change: round2(price - prevClose),
        changePct,
        volume,
        turnover: Math.round(price * volume),
        bid: round2(price * 0.995),
        ask: round2(price * 1.005),
        hasLivePrice: true
      };
    });

    return {
      provider: "gatecep-generated-nse-feed",
      generatedAt: new Date().toISOString(),
      count: data.length,
      data
    };
  }
}

export const marketDataGateway = new MarketDataGateway();
