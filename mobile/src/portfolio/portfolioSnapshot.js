import AsyncStorage from "@react-native-async-storage/async-storage";

export const PORTFOLIO_SNAPSHOTS_KEY = "gatecepPortfolioSnapshots";

export async function savePortfolioSnapshot({
  investedValue = 0,
  currentValue = 0,
  cash = 0,
  healthScore = 0,
  healthRating = "",
  netGainLoss = 0,
  gainLossPct = 0
} = {}) {
  const today = new Date().toISOString().slice(0, 10);

  const raw = await AsyncStorage.getItem(PORTFOLIO_SNAPSHOTS_KEY);
  const existing = raw ? JSON.parse(raw) : [];

  const snapshot = {
    date: today,
    investedValue: Number(investedValue || 0),
    currentValue: Number(currentValue || 0),
    cash: Number(cash || 0),
    totalValue: Number(currentValue || 0) + Number(cash || 0),
    healthScore: Number(healthScore || 0),
    healthRating,
    netGainLoss: Number(netGainLoss || 0),
    gainLossPct: Number(gainLossPct || 0),
    savedAt: new Date().toISOString()
  };

  const withoutToday = existing.filter((item) => item.date !== today);

  const next = [snapshot, ...withoutToday]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 365);

  await AsyncStorage.setItem(PORTFOLIO_SNAPSHOTS_KEY, JSON.stringify(next));

  return snapshot;
}

export async function loadPortfolioSnapshots() {
  const raw = await AsyncStorage.getItem(PORTFOLIO_SNAPSHOTS_KEY);

  if (!raw) return [];

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) return [];

  return parsed.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function clearPortfolioSnapshots() {
  await AsyncStorage.removeItem(PORTFOLIO_SNAPSHOTS_KEY);
}