import SimulatedDataAdapter from "./SimulatedDataAdapter.js";
import DelayedPublicDataAdapter from "./DelayedPublicDataAdapter.js";
import LicensedNseVendorAdapter from "./LicensedNseVendorAdapter.js";

export class MarketDataGateway {
  constructor() {
    this.mode = process.env.MARKET_DATA_PROVIDER || process.env.MARKET_DATA_MODE || "SIMULATED";
  }

  adapter() {
    if (this.mode === "LICENSED_NSE_VENDOR") return LicensedNseVendorAdapter;
    if (this.mode === "DELAYED_PUBLIC") return DelayedPublicDataAdapter;
    return SimulatedDataAdapter;
  }

  async getPrices() {
    return this.adapter().getPrices();
  }

  async getCandles(symbol, interval = "1m") {
    return this.adapter().getCandles(symbol, interval);
  }

  async getMarketSummary() {
    return this.adapter().getMarketSummary();
  }
}

export const marketDataGateway = new MarketDataGateway();
