import { withMarketFields } from "../data/securities.js";
import { MarketDataProvider } from "./MarketDataProvider.js";

function makeDepth(price = 15) {
  const p = Number(price || 15);
  return {
    bids: [
      { split: 10, qty: 8262, price: +(p - 0.10).toFixed(2) },
      { split: 20, qty: 37969, price: +(p - 0.15).toFixed(2) },
      { split: 6, qty: 109210, price: +(p - 0.20).toFixed(2) },
      { split: 70, qty: 128736, price: +(p - 0.25).toFixed(2) },
      { split: 5, qty: 9030, price: +(p - 0.35).toFixed(2) }
    ],
    asks: [
      { price: +(p + 0.00).toFixed(2), qty: 60989, split: 1 },
      { price: +(p + 0.05).toFixed(2), qty: 32364, split: 7 },
      { price: +(p + 0.10).toFixed(2), qty: 2801, split: 1 },
      { price: +(p + 0.15).toFixed(2), qty: 55635, split: 6 },
      { price: +(p + 0.20).toFixed(2), qty: 50000, split: 2 }
    ]
  };
}

export class DemoNSEProvider extends MarketDataProvider {
  async getQuotes() {
    return withMarketFields().map(x => ({
      ...x,
      source: "demo",
      delayed: true,
      depthAvailable: true
    }));
  }

  async getDepth(symbol) {
    const quote = (await this.getQuotes()).find(x => x.symbol === symbol);
    if (!quote) throw new Error("Security not found");
    return {
      symbol,
      source: "demo",
      delayed: true,
      lastPrice: quote.price,
      depth: makeDepth(quote.price)
    };
  }
}
