export function calculatePortfolioHealth({
  holdings = [],
  cash = 0,
  currentValue = 0,
  sectorRows = []
}) {
  const sectorCount = sectorRows.length;
  const largestSector = sectorRows[0];
  const largestWeight = Number(largestSector?.weight || 0);

  const positionCount = holdings.length;
  const totalPortfolioValue = Number(currentValue || 0) + Number(cash || 0);
  const cashWeight =
    totalPortfolioValue > 0 ? (Number(cash || 0) / totalPortfolioValue) * 100 : 0;

  const diversificationScore =
    sectorCount >= 6 ? 35 : sectorCount >= 4 ? 28 : sectorCount >= 3 ? 20 : 10;

  const concentrationScore =
    largestWeight <= 25 ? 30 : largestWeight <= 35 ? 22 : largestWeight <= 50 ? 12 : 5;

  const cashScore =
    cashWeight >= 5 && cashWeight <= 20
      ? 20
      : cashWeight > 20 && cashWeight <= 35
      ? 14
      : cashWeight > 0
      ? 8
      : 3;

  const breadthScore =
    positionCount >= 10 ? 15 : positionCount >= 6 ? 11 : positionCount >= 3 ? 7 : 3;

  const score = Math.max(
    0,
    Math.min(
      100,
      diversificationScore + concentrationScore + cashScore + breadthScore
    )
  );

  const strengths = [];
  const watchlist = [];

  if (sectorCount >= 4) {
    strengths.push("Good sector diversification.");
  } else {
    watchlist.push("Portfolio is concentrated in too few sectors.");
  }

  if (largestWeight <= 35) {
    strengths.push("Largest sector exposure is within a reasonable range.");
  } else {
    watchlist.push(
      `${largestSector?.sector || "Largest sector"} exposure is high at ${largestWeight.toFixed(1)}%.`
    );
  }

  if (cashWeight >= 5 && cashWeight <= 20) {
    strengths.push("Healthy cash reserve for flexibility.");
  } else if (cashWeight < 5) {
    watchlist.push("Cash reserve is low; consider keeping trading space available.");
  } else {
    watchlist.push("Cash reserve is high; consider planned deployment if aligned with goals.");
  }

  if (positionCount >= 6) {
    strengths.push("Portfolio has a reasonable number of positions.");
  } else {
    watchlist.push("Portfolio breadth is limited.");
  }

  const rating =
    score >= 85 ? "EXCELLENT" : score >= 70 ? "GOOD" : score >= 55 ? "MODERATE" : "NEEDS_ATTENTION";

  return {
    score,
    rating,
    components: {
      diversificationScore,
      concentrationScore,
      cashScore,
      breadthScore
    },
    strengths,
    watchlist,
    cashWeight,
    largestWeight,
    sectorCount,
    positionCount
  };
}