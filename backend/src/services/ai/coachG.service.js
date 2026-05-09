const symbols = ["SCOM", "EQTY", "KCB", "COOP"];

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

    return {
      symbol,
      signal,
      recommendation,
      confidence,
      momentum,
      movingAverageTrend,
      volatility,
      generatedAt:
        new Date().toISOString()
    };
  });
}