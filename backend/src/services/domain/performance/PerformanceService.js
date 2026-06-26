export function calculatePortfolioPerformance(holdings = []) {
  const totalValue = holdings.reduce(
    (sum, h) => sum + Number(h.marketValue || 0),
    0
  );

  const allocationMap = {};

  const enrichedHoldings = holdings.map((h) => {
    const quantity = Number(h.quantity || 0);
    const averagePrice = Number(h.averagePrice || 0);
    const marketValue = Number(h.marketValue || 0);
    const investedValue = quantity * averagePrice;
    const unrealizedGain = marketValue - investedValue;
    const unrealizedGainPct =
      investedValue > 0
        ? Number(((unrealizedGain / investedValue) * 100).toFixed(2))
        : 0;

    const sector = h.sector || "Unknown";
    allocationMap[sector] = (allocationMap[sector] || 0) + marketValue;

    return {
      ...h,
      value: marketValue,
      cost: investedValue,
      investedValue,
      unrealizedGain,
      unrealizedGainPct,
      gain: unrealizedGain,
      gainPct: unrealizedGainPct,
      weight:
        totalValue > 0
          ? Number(((marketValue / totalValue) * 100).toFixed(2))
          : 0
    };
  });

  const allocation = Object.entries(allocationMap)
    .map(([sector, value]) => ({
      sector,
      value,
      weight:
        totalValue > 0
          ? Number(((value / totalValue) * 100).toFixed(2))
          : 0
    }))
    .sort((a, b) => b.value - a.value);

  const ranked = [...enrichedHoldings].sort(
    (a, b) => b.unrealizedGainPct - a.unrealizedGainPct
  );

  return {
    totalValue,
    allocation,
    holdings: enrichedHoldings,
    topGainers: ranked.slice(0, 5),
    topLosers: [...ranked].reverse().slice(0, 5),
    bestHolding: ranked[0] || null,
    worstHolding: ranked[ranked.length - 1] || null
  };
}