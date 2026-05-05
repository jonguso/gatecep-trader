export function getPriceBand(referencePrice, lowerPct = 0.10, upperPct = 0.10) {
  const ref = Number(referencePrice || 0);

  if (!ref || ref <= 0) {
    return {
      minPrice: 0,
      maxPrice: Number.MAX_SAFE_INTEGER,
      referencePrice: ref,
      valid: false
    };
  }

  return {
    minPrice: Number((ref * (1 - lowerPct)).toFixed(2)),
    maxPrice: Number((ref * (1 + upperPct)).toFixed(2)),
    referencePrice: ref,
    valid: true
  };
}

export function isPriceAllowed(price, band) {
  const p = Number(price || 0);
  if (!band?.valid) return true;
  return p >= band.minPrice && p <= band.maxPrice;
}
