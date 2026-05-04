import SimulatedDataAdapter from "./SimulatedDataAdapter.js";

export default {
  async getPrices() {
    const res = await SimulatedDataAdapter.getPrices();
    return {
      ...res,
      provider: "DELAYED_PUBLIC",
      delayed: true,
      delayMinutes: Number(process.env.MARKET_DATA_DELAY_MINUTES || 15),
      disclaimer: "Delayed/public data mode. Replace with authorized vendor feed before production trading."
    };
  },

  async getCandles(symbol, interval = "1m") {
    return SimulatedDataAdapter.getCandles(symbol, interval);
  },

  async getMarketSummary() {
    const res = await SimulatedDataAdapter.getMarketSummary();
    return { ...res, provider: "DELAYED_PUBLIC", delayed: true };
  }
};
