export function getPriceBand({ referencePrice, lowerPct = 0.10, upperPct = 0.10 }) {
  const ref = Number(referencePrice || 0);
  if (!ref || ref <= 0) return { minPrice: 0, maxPrice: Number.MAX_SAFE_INTEGER, referencePrice: ref, valid: false };
  return {
    minPrice: Number((ref * (1 - lowerPct)).toFixed(2)),
    maxPrice: Number((ref * (1 + upperPct)).toFixed(2)),
    referencePrice: ref,
    valid: true
  };
}

export function validateLimitPrice({ side, price, referencePrice, lowerPct = 0.10, upperPct = 0.10 }) {
  const cleanPrice = Number(price);
  const band = getPriceBand({ referencePrice, lowerPct, upperPct });
  if (!band.valid) return { ok: true, band };
  if (cleanPrice < band.minPrice || cleanPrice > band.maxPrice) {
    return { ok: false, band, error: `${side} price must be between KES ${band.minPrice} and KES ${band.maxPrice}.` };
  }
  return { ok: true, band };
}
