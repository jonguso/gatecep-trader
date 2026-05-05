import { withMarketFields } from "../../data/securities.js";

export const marketDataGateway = {
  async getPrices() {
    return {
      provider: "demo-nse-feed",
      delayed: true,
      disclaimer: "Demo market data only.",
      data: withMarketFields()
    };
  }
};
