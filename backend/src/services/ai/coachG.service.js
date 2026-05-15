import { getPortfolioRiskAnalysis } from "../portfolio/riskAnalysis.service.js";
import { getSectorAllocation } from "../portfolio/sectorAllocation.service.js";
import { getUnifiedPortfolio } from "../portfolio/unifiedPortfolio.service.js";

const symbols = ["SCOM", "EQTY", "KCB", "COOP"];

const marketPrices = {
  SCOM: {
    price: 30.2,
    lastPrice: 30.2,
    changePct: 3.54,
    volume: 180000
  },
  EQTY: {
    price: 75.2,
    lastPrice: 75.2,
    changePct: -2.17,
    volume: 95000
  },
  KCB: {
    price: 43.75,
    lastPrice: 43.75,
    changePct: 0.82,
    volume: 130000
  },
  COOP: {
    price: 18.45,
    lastPrice: 18.45,
    changePct: 1.15,
    volume: 70000
  }
};

function randomSignal() {
  const signals = ["BUY", "SELL", "HOLD"];
  return signals[Math.floor(Math.random() * signals.length)];
}

export function generateCoachGSignals() {
  return symbols.map((symbol) => {
    const signal = randomSignal();

    const confidence =
      Math.floor(65 + Math.random() * 35);

    const momentum =
      Math.random() > 0.5
        ? "BULLISH"
        : "BEARISH";

    const movingAverageTrend =
      Math.random() > 0.5
        ? "MA_CROSS_UP"
        : "MA_CROSS_DOWN";

    const volatility =
      Math.random() > 0.5
        ? "LOW"
        : "HIGH";

    let recommendation = signal;

    if (
      signal === "BUY" &&
      momentum === "BULLISH"
    ) {
      recommendation =
        "STRONG_BUY";
    }

    if (
      signal === "SELL" &&
      momentum === "BEARISH"
    ) {
      recommendation =
        "STRONG_SELL";
    }

    const market = marketPrices[symbol] || {};

return {
  symbol,
  signal,
  recommendation,
  confidence,
  momentum,
  movingAverageTrend,
  volatility,

  price: Number(market.price || 0),
  marketPrice: Number(market.price || market.lastPrice || 0),
  lastPrice: Number(market.lastPrice || market.price || 0),
  changePct: Number(market.changePct || 0),
  volume: Number(market.volume || 0),

  generatedAt: new Date().toISOString()
};
  });
}
export async function getCoachGPortfolioAdvice() {
  const portfolio = await getUnifiedPortfolio();

  const risk = await getPortfolioRiskAnalysis();

  const sectors = await getSectorAllocation();

  const advice = [];

  if (risk.concentrationRisk === "HIGH") {
    advice.push(
      "Portfolio concentration is high. Add more NSE counters."
    );
  }

  if (risk.brokerRisk === "HIGH") {
    advice.push(
      "Single broker exposure detected. Add another broker."
    );
  }

  const bankingExposure =
    sectors.sectors.find(
      (x) => x.sector === "Banking"
    );

  if (bankingExposure?.weight > 60) {
    advice.push(
      "Banking sector exposure exceeds 60%."
    );
  }

  if (portfolio.totalUnrealizedPnL < 0) {
    advice.push(
      "Portfolio currently has unrealized losses."
    );
  }

  if (advice.length === 0) {
    advice.push(
      "Portfolio structure currently looks healthy."
    );
  }

  return {
    coach: "Coach G",
    diversificationScore:
      risk.diversificationScore,
    portfolioValue:
      portfolio.totalMarketValue,
    advice,
    generatedAt:
      new Date().toISOString()
  };
}