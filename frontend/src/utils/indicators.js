export function calculateEMA(data, period = 10) {
  const multiplier = 2 / (period + 1);

  let ema = data[0];

  return data.map((price) => {
    ema =
      (price - ema) * multiplier + ema;

    return Number(ema.toFixed(2));
  });
}

export function calculateRSI(
  closes,
  period = 14
) {
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff =
      closes[i] - closes[i - 1];

    if (diff >= 0) {
      gains += diff;
    } else {
      losses += Math.abs(diff);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) {
    return 100;
  }

  const rs = avgGain / avgLoss;

  return Number(
    (
      100 - 100 / (1 + rs)
    ).toFixed(2)
  );
}