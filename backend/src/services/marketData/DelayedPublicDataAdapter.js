export default {
  async getPrices() {
    return {
      provider: "DELAYED_PUBLIC_NOT_CONFIGURED",
      delayed: true,
      delayMinutes: Number(process.env.MARKET_DATA_DELAY_MINUTES || 15),
      disclaimer:
        "Delayed public data adapter is not configured yet. Use MARKET_DATA_PROVIDER=LOCAL_EOD until a public source is connected.",
      data: []
    };
  },

  async getCandles() {
    return {
      provider: "DELAYED_PUBLIC_NOT_CONFIGURED",
      data: []
    };
  },

  async getMarketSummary() {
    return {
      provider: "DELAYED_PUBLIC_NOT_CONFIGURED",
      marketStatus: "NOT_CONFIGURED",
      gainers: [],
      losers: [],
      active: []
    };
  }
};