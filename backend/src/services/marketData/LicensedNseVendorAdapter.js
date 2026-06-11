import axios from "axios";

function isConfigured() {
  return Boolean(
    process.env.NSE_VENDOR_BASE_URL &&
      process.env.NSE_VENDOR_API_KEY
  );
}

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
    if (!isConfigured()) {
      return {
        provider: "LICENSED_NSE_NOT_CONFIGURED",
        delayed: false,
        disclaimer:
          "Licensed NSE vendor adapter is not configured. Add NSE_VENDOR_BASE_URL and NSE_VENDOR_API_KEY before using this provider.",
        data: []
      };
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
    if (!isConfigured()) {
      return {
        provider: "LICENSED_NSE_NOT_CONFIGURED",
        symbol,
        interval,
        data: []
      };
    }

    const res = await client().get(`/candles/${symbol}`, {
      params: { interval }
    });

    return res.data.data || res.data;
  },

  async getMarketSummary() {
    if (!isConfigured()) {
      return {
        provider: "LICENSED_NSE_NOT_CONFIGURED",
        marketStatus: "NOT_CONFIGURED",
        gainers: [],
        losers: [],
        active: []
      };
    }

    const res = await client().get("/market-summary");

    return {
      provider: "LICENSED_NSE_VENDOR",
      ...res.data
    };
  }
};