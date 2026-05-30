import {
  nseSecurityMaster,
  applySecurityMaster
} from "../../data/nseSecurityMaster.js";

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function round2(value) {
  return Number(Number(value || 0).toFixed(2));
}

const MARKET_BASE_PRICES = {
  ABSA: 29.00,
  AMAC: 102.00,
  BAMB: 32.00,
  BAT: 520.00,
  BKG: 52.50,
  BOC: 178.25,
  BRIT: 12.50,
  CARB: 29.50,
  CGEN: 79.25,
  CIC: 4.16,
  COOP: 31.60,
  DTK: 149.00,
  EABL: 248.00,
  EQT: 75.25,
  GLD: 5650.00,
  HFCK: 9.70,
  IMH: 50.50,
  KCB: 67.75,
  KEGN: 9.12,
  KPC: 9.20,
  KPLC: 16.10,
  KNRE: 3.34,
  KQ: 5.88,
  NCBA: 88.00,
  NSE: 18.75,
  SBIC: 270.00,
  SCBK: 336.00,
  SCOM: 30.60,
  SMWF: 940.00,
  TOTL: 46.00
};

function priceFor(symbol) {

  const base =
    MARKET_BASE_PRICES[
      String(symbol || "")
      .trim()
      .toUpperCase()
    ] || 25;

  const movement =
    (
      (
        symbol.charCodeAt(0) % 5
      ) - 2
    ) * 0.35;

  return round2(
    base + movement
  );

}

class MarketDataGateway {

  async getPrices() {

    const securities =
      Object.values(
        nseSecurityMaster
      );

    const data =
      securities.map(
        (security)=>{

      const price =
        priceFor(
          security.symbol
        );

      const changePct =
        round2(
          rand(-4,4)
        );

      const prevClose =
        price /
        (
          1 +
          changePct/100
        );

      const volume =
        Math.floor(
          rand(
            10000,
            8000000
          )
        );

      const row = {

        symbol:
          security.symbol,

        name:
          security.name,

        sector:
          security.sector,

        price,

        lastPrice:
          price,

        open:
          round2(
            prevClose*1.01
          ),

        high:
          round2(
            price*1.03
          ),

        low:
          round2(
            price*0.97
          ),

        prevClose:
          round2(
            prevClose
          ),

        change:
          round2(
            price-prevClose
          ),

        changePct,

        volume,

        turnover:
          Math.round(
            price*
            volume
          ),

        bid:
          round2(
            price*0.995
          ),

        ask:
          round2(
            price*1.005
          ),

        hasLivePrice:
          true

      };

      return applySecurityMaster(
        row
      );

    });

    return {

      provider:
        "gatecep-generated-nse-feed",

      generatedAt:
        new Date()
        .toISOString(),

      count:
        data.length,

      data

    };

  }

}

export const marketDataGateway =
  new MarketDataGateway();