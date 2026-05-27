const brokerScores = {
  AIB: {
    latency: 92,
    liquidity: 88,
    reliability: 94,
    fees: 82
  },
  ABC: {
    latency: 85,
    liquidity: 80,
    reliability: 88,
    fees: 90
  },
  NCBA: {
    latency: 78,
    liquidity: 76,
    reliability: 84,
    fees: 86
  }
};

export function selectBestBroker({
  symbol,
  side,
  quantity,
  price,
  preferredBroker
}) {
  const scored = Object.entries(brokerScores).map(
    ([broker, score]) => {
      const totalScore =
        score.latency * 0.25 +
        score.liquidity * 0.35 +
        score.reliability * 0.25 +
        score.fees * 0.15;

      return {
        broker,
        score: Math.round(totalScore),
        reason:
          "Best blend of liquidity, reliability, execution speed, and cost."
      };
    }
  );

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];

  return {
    selectedBroker:
      preferredBroker && brokerScores[preferredBroker]
        ? preferredBroker
        : best.broker,
    recommendedBroker: best.broker,
    score: best.score,
    ranking: scored,
    reason: best.reason
  };
}