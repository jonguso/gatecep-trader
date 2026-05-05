import { MarketDataProvider } from "./MarketDataProvider.js";

export class VendorNSEProvider extends MarketDataProvider {
  constructor({ baseUrl, apiKey, vendorName = "authorised-vendor" }) {
    super();
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.vendorName = vendorName;
  }

  async request(path) {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error("Vendor API credentials are not configured");
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "X-API-Key": this.apiKey,
        Accept: "application/json"
      }
    });

    if (!res.ok) throw new Error(`Vendor API error ${res.status}`);
    return res.json();
  }

  async getQuotes() {
    const payload = await this.request("/market/quotes");
    return (payload.data || payload || []).map(x => ({
      symbol: x.ticker || x.symbol,
      name: x.securityName || x.name,
      sector: x.sector || x.industry,
      price: Number(x.last || x.lastPrice || x.price),
      lastPrice: Number(x.last || x.lastPrice || x.price),
      prevClose: Number(x.prevClose || x.previousClose),
      changePct: Number(x.percentChange || x.changePct),
      volume: Number(x.volume || x.tradedVolume),
      turnover: Number(x.turnover),
      source: this.vendorName,
      delayed: !!x.delayed
    }));
  }

  async getDepth(symbol) {
    const payload = await this.request(`/market/depth/${symbol}`);
    return {
      symbol,
      source: this.vendorName,
      delayed: !!payload.delayed,
      depth: {
        bids: payload.bids || payload.buy || [],
        asks: payload.asks || payload.sell || []
      }
    };
  }
}
