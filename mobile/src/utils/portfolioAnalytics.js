export function calculatePortfolioAnalytics({
  holdings = [],
  cash = 0,
  trades = []
}) {
  const cleanHoldings = holdings.map((h) => {
    const qty = Number(h.quantity || 0);

    const avgPrice =
      Number(h.averagePrice || h.price || 0);

    const marketPrice =
      Number(
        h.marketPrice ||
        h.price ||
        avgPrice
      );

    const invested =
      qty * avgPrice;

    const current =
      qty * marketPrice;

    return {
      ...h,
      qty,
      avgPrice,
      marketPrice,
      invested,
      current
    };
  });

  const investedValue =
    cleanHoldings.reduce(
      (sum, h) => sum + h.invested,
      0
    );

  const currentValue =
    cleanHoldings.reduce(
      (sum, h) => sum + h.current,
      0
    );

  const netWorth =
    currentValue + Number(cash || 0);

  const netGainLoss =
    currentValue - investedValue;

  const gainLossPct =
    investedValue > 0
      ? (netGainLoss / investedValue) * 100
      : 0;

  const sectorMap = {};

  cleanHoldings.forEach((holding) => {
    const sector =
      holding.sector ||
      "Unknown";

    if (!sectorMap[sector]) {
      sectorMap[sector] = {
        sector,
        totalValue: 0,
        securities: []
      };
    }

    sectorMap[sector].totalValue +=
      holding.current;

    sectorMap[sector].securities.push(
      holding.symbol
    );
  });

  const sectorRows =
    Object.values(sectorMap)
      .map((sector) => ({
        ...sector,
        weight:
          currentValue > 0
            ? (
                sector.totalValue /
                currentValue
              ) * 100
            : 0
      }))
      .sort(
        (a, b) =>
          b.totalValue -
          a.totalValue
      );

  const largestSector =
    sectorRows.length
      ? sectorRows[0]
      : null;

  const diversification =
    sectorRows.length >= 6
      ? "HIGH"
      : sectorRows.length >= 3
      ? "MEDIUM"
      : "LOW";

  const risk =
    largestSector &&
    largestSector.weight > 60
      ? "HIGH_RISK"
      : largestSector &&
        largestSector.weight > 35
      ? "MEDIUM_RISK"
      : "BALANCED";

  const tradeStats = {
    totalTrades: trades.length,

    buyTrades:
      trades.filter(
        (t) => t.side === "BUY"
      ).length,

    sellTrades:
      trades.filter(
        (t) => t.side === "SELL"
      ).length,

    totalFees:
      trades.reduce(
        (sum, t) =>
          sum +
          Number(
            t.totalFees || 0
          ),
        0
      )
  };

  return {
    investedValue,
    currentValue,
    cash,

    netWorth,

    netGainLoss,

    gainLossPct,

    sectorRows,

    largestSector,

    diversification,

    risk,

    tradeStats
  };
}