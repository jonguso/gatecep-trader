import { MarketDataProvider } from "./MarketDataProvider.js";

export class NSEDirectProvider extends MarketDataProvider {
  constructor({ baseUrl, apiKey }) {
    super();
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async request(path) {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error("NSE direct API credentials are not configured");
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json"
      }
    });

    if (!res.ok) throw new Error(`NSE API error ${res.status}`);
    return res.json();
  }

  async getQuotes() {
    const payload = await this.request("/quotes");
    return (payload.data || payload || []).map(x => ({
      symbol: x.symbol,
      name: x.name,
      sector: x.sector,
      price: Number(x.lastPrice || x.price),
      lastPrice: Number(x.lastPrice || x.price),
      prevClose: Number(x.prevClose || x.previousClose),
      changePct: Number(x.changePct),
      volume: Number(x.volume || x.tradedVolume),
      turnover: Number(x.turnover),
      source: "nse-direct",
      delayed: false
    }));
  }

  async getDepth(symbol) {
    const payload = await this.request(`/depth/${symbol}`);
    return {
      symbol,
      source: "nse-direct",
      delayed: false,
      depth: payload.depth || {
        bids: payload.bids || [],
        asks: payload.asks || []
      }
    };
  }
}
