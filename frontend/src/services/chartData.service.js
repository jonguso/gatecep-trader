export function generateCandles(symbol = "SCOM") {
  const candles = [];

  let price = 18.45;

  for (let i = 0; i < 60; i++) {
    const open = price;

    const high =
      open + Math.random() * 0.4;

    const low =
      open - Math.random() * 0.4;

    const close =
      low + Math.random() * (high - low);

    const volume =
      Math.floor(Math.random() * 100000);

    candles.push({
      time: `T${i}`,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    });

    price = close;
  }

  return candles;
}