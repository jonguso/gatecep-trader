import { addUserHolding, getUserPortfolio } from "./portfolioApi";

export async function syncHoldingsToCloud(rows = []) {
  const saved = [];

  for (const row of rows) {
    if (!row.symbol || Number(row.quantity || 0) <= 0) continue;

    const holding = await addUserHolding(row);
    saved.push(holding);
  }

  return {
    ok: true,
    savedCount: saved.length,
    saved
  };
}

export async function loadCloudPortfolio() {
  return await getUserPortfolio();
}