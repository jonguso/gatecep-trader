import { NSE_SECURITY_MASTER } from "../../data/nseSecurityMaster.js";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function round2(value) {
  return Number(Number(value || 0).toFixed(2));
}

const MARKET_BASE_PRICES = {
  ABSA: 28.30,
  AMAC: 8.50,
  BAMB: 32.00,
  BAT: 573.00,
  BKG: 34.50,
  BOC: 95.00,
  BRIT: 16.38,
  CARB: 28.50,
  CGEN: 24.00,
  CIC: 2.85,
  COOP: 29.00,
  DTB: 70.00,
  EABL: 241.75,
  EQTY: 74.50,
  HFCK: 5.20,
  IMH: 42.00,
  KCB: 67.50,
  KEGN: 8.20,
  KPLC: 16.25,
  KNRE: 2.30,
  KQ: 4.15,
  NCBA: 44.49,
  NSE: 20.30,
  SCBK: 210.00,
  SCOM: 29.85,
  SLAM: 8.90,
  TOTL: 24.50
};

function priceFor(symbol) {
  const base = MARKET_BASE_PRICES[symbol] || 25;
  const movement = ((symbol.charCodeAt(0) % 5) - 2) * 0.35;
  return round2(base + movement);
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
