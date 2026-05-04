import axios from "axios";

function client() {
  return axios.create({
    baseURL: process.env.NSE_VENDOR_BASE_URL,
    headers: {
      Authorization: `Bearer ${process.env.NSE_VENDOR_API_KEY}`,
      "Content-Type": "application/json"
    },
    timeout: 15000
  });
}

export default {
  async getPrices() {
    if (!process.env.NSE_VENDOR_BASE_URL || !process.env.NSE_VENDOR_API_KEY) {
      throw new Error("Licensed NSE vendor credentials are missing");
    }

    const res = await client().get("/prices");
    return {
      provider: "LICENSED_NSE_VENDOR",
      delayed: false,
      disclaimer: "Licensed market data feed.",
      data: res.data.data || res.data
    };
  },

  async getCandles(symbol, interval = "1m") {
    const res = await client().get(`/candles/${symbol}`, { params: { interval } });
    return res.data.data || res.data;
  },

  async getMarketSummary() {
    const res = await client().get("/market-summary");
    return { provider: "LICENSED_NSE_VENDOR", ...res.data };
  }
};
