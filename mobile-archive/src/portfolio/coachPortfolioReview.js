export function buildCoachPortfolioReview({
  holdings = [],
  cash = 0,
  currentValue = 0,
  sectorRows = [],
  health = null
}) {
  const largestSector = sectorRows[0];
  const largestWeight = Number(largestSector?.weight || 0);

  const missingSectors = [];

  const sectorNames = sectorRows.map((s) =>
    String(s.sector || "").toLowerCase()
  );

  if (!sectorNames.some((s) => s.includes("etf"))) {
    missingSectors.push("ETF");
  }

  if (!sectorNames.some((s) => s.includes("energy"))) {
    missingSectors.push("Energy and Petroleum");
  }

  if (!sectorNames.some((s) => s.includes("insurance"))) {
    missingSectors.push("Insurance");
  }

  const strengths = [...(health?.strengths || [])];
  const watchlist = [...(health?.watchlist || [])];

  if (currentValue > 0 && cash > 0) {
    strengths.push("Cash is available for future opportunities.");
  }

  if (largestWeight > 40) {
    watchlist.push(
      `${largestSector?.sector || "Largest sector"} is above 40%, which may increase concentration risk.`
    );
  }

  missingSectors.forEach((sector) => {
    watchlist.push(`No visible exposure to ${sector}.`);
  });

  const recommendations = [];

  if (missingSectors.includes("ETF")) {
    recommendations.push({
      title: "Add ETF exposure",
      detail: "ETF exposure can improve diversification and reduce single-stock risk.",
      symbols: ["GLD", "SMWF"]
    });
  }

  if (missingSectors.includes("Energy and Petroleum")) {
    recommendations.push({
      title: "Consider Energy exposure",
      detail: "Energy exposure can balance banking, telecom, and manufacturing concentration.",
      symbols: ["KEGN", "KPLC"]
    });
  }

  if (largestWeight > 40) {
    recommendations.push({
      title: "Reduce concentration risk",
      detail: `Avoid adding more to ${largestSector?.sector || "the largest sector"} until other sectors catch up.`,
      symbols: []
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      title: "Maintain balanced accumulation",
      detail: "Continue adding gradually across underweight sectors.",
      symbols: []
    });
  }

  return {
    score: health?.score || 0,
    rating: health?.rating || "N/A",
    largestSector: largestSector?.sector || "N/A",
    largestWeight,
    missingSectors,
    strengths: strengths.slice(0, 5),
    watchlist: watchlist.slice(0, 5),
    recommendations
  };
}