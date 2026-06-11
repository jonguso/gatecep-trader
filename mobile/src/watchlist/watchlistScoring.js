export function scoreWatchlistSignal(item = {}) {
  const changePct = Number(item.changePct || 0);

  let action = "WATCH";
  let confidence = 50;
  let reason = "Monitoring price movement";

  if (changePct >= 3) {
    action = "BUY";
    confidence = 85;
    reason = "Strong positive momentum";
  } else if (changePct >= 1) {
    action = "ACCUMULATE";
    confidence = 75;
    reason = "Positive trend developing";
  } else if (changePct > -1) {
    action = "HOLD";
    confidence = 70;
    reason = "Stable price action";
  } else {
    action = "CAUTION";
    confidence = 65;
    reason = "Negative price momentum";
  }

  if (item.symbol === "BAT") {
    action = "INCOME";
    confidence = 91;
    reason = "High dividend income profile";
  }

  return {
    ...item,
    action,
    confidence,
    reason
  };
}

export function buildWatchlistScores(signals = []) {
  return signals.map(scoreWatchlistSignal);
}