import { generateCoachGSignals } from "../ai/coachG.service.js";

const watchlist = [
  "SCOM",
  "EQTY",
  "KCB",
  "COOP"
];

const prices = {
  SCOM: 18.45,
  EQTY: 47.2,
  KCB: 31.8,
  COOP: 15.6
};

export function getWatchlist() {
  const signals = generateCoachGSignals();

  return watchlist.map((symbol) => {
    const move =
      Number((Math.random() * 0.6 - 0.3).toFixed(2));

    prices[symbol] = Number(
      (prices[symbol] + move).toFixed(2)
    );

    const signal =
      signals.find(
        (s) => s.symbol === symbol
      ) || {};

    return {
      symbol,
      price: prices[symbol],
      change: move,
      changePct: Number(
        ((move / prices[symbol]) * 100).toFixed(2)
      ),
      recommendation:
        signal.recommendation,
      confidence:
        signal.confidence,
      hot:
        signal.confidence >= 85
    };
  });
}