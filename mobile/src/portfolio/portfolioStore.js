import {
  userGetItem,
  userSetItem
} from "../auth/userStorage";
import { applySecurityMaster } from "../utils/nseSecurityMaster";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:4000";

export const PORTFOLIO_KEY = "portfolio";

export function normalizePortfolioHolding(row = {}) {
  const mastered = applySecurityMaster(row);

  const quantity = Number(mastered.quantity || 0);

  const rawMarketPrice = Number(
    mastered.marketPrice ||
      mastered.lastPrice ||
      mastered.price ||
      0
  );

  const rawMarketValue = Number(
    mastered.marketValue ||
      mastered.value ||
      (quantity > 0 && rawMarketPrice > 0 ? quantity * rawMarketPrice : 0)
  );

  const rawProfitLoss = Number(
    mastered.profitLoss ||
      mastered.unrealizedPnL ||
      mastered.gainLoss ||
      0
  );

  const impliedCostValue =
    rawMarketValue > 0 && rawProfitLoss !== 0
      ? rawMarketValue - rawProfitLoss
      : 0;

  const averagePrice = Number(
    mastered.averagePrice ||
      mastered.averageCost ||
      mastered.costPrice ||
      mastered.purchasePrice ||
      (impliedCostValue > 0 && quantity > 0
        ? impliedCostValue / quantity
        : 0)
  );

  const fallbackMarketPrice =
    rawMarketPrice ||
    (rawMarketValue > 0 && quantity > 0
      ? rawMarketValue / quantity
      : 0);

  const costValue = quantity * averagePrice;
  const marketValue = quantity * fallbackMarketPrice;
  const profitLoss = marketValue - costValue;

  const profitLossPct =
    costValue > 0 ? (profitLoss / costValue) * 100 : 0;

  return {
    ...mastered,
    broker: mastered.broker || "LOCAL_PORTFOLIO",
    symbol: String(mastered.symbol || "").toUpperCase().trim(),
    name: mastered.name || mastered.symbol,
    sector: mastered.sector || "Unknown",
    quantity,
    averagePrice,
    averageCost: averagePrice,
    marketPrice: fallbackMarketPrice,
    price: fallbackMarketPrice,
    lastPrice: fallbackMarketPrice,
    marketValue,
    value: marketValue,
    costValue,
    investedValue: costValue,
    profitLoss,
    profitLossPct,
    changePct: profitLossPct,
    updatedAt: new Date().toISOString()
  };
}

export async function savePortfolio(rows = []) {
  const portfolio = rows
    .filter((row) => row?.symbol && Number(row.quantity || 0) > 0)
    .map(normalizePortfolioHolding);

  await userSetItem(PORTFOLIO_KEY, JSON.stringify(portfolio));

  return portfolio;
}

export async function loadPortfolio({ revalue = true } = {}) {
  const raw = await userGetItem(PORTFOLIO_KEY);

  if (!raw) return [];

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) return [];

  const normalized = parsed.map(normalizePortfolioHolding);

  if (!revalue) {
    await userSetItem(PORTFOLIO_KEY, JSON.stringify(normalized));
    return normalized;
  }

  const revalued = await revaluePortfolio(normalized);

  await userSetItem(PORTFOLIO_KEY, JSON.stringify(revalued));

  return revalued;
}

export async function revaluePortfolio(rows = []) {
  const priceMap = await fetchMarketPriceMap();

  return rows.map((row) => {
    const mastered = normalizePortfolioHolding(row);
    const symbol = mastered.symbol;

    const live = priceMap.get(symbol);

    const marketPrice = Number(
      live?.price ||
        live?.lastPrice ||
        mastered.marketPrice ||
        mastered.price ||
        0
    );

    const quantity = Number(mastered.quantity || 0);

    const averagePrice = Number(
      mastered.averagePrice ||
        mastered.averageCost ||
        0
    );

    const costValue = quantity * averagePrice;
    const marketValue = quantity * marketPrice;
    const profitLoss = marketValue - costValue;

    const profitLossPct =
      costValue > 0 ? (profitLoss / costValue) * 100 : 0;

    return {
      ...mastered,
      name: live?.name || mastered.name,
      sector: live?.sector || mastered.sector || "Unknown",
      quantity,
      averagePrice,
      averageCost: averagePrice,
      marketPrice,
      price: marketPrice,
      lastPrice: marketPrice,
      marketValue,
      value: marketValue,
      costValue,
      investedValue: costValue,
      profitLoss,
      profitLossPct,
      changePct: profitLossPct,
      marketChangePct: Number(live?.changePct || 0),
      bid: live?.bid,
      ask: live?.ask,
      volume: live?.volume,
      turnover: live?.turnover,
      hasLivePrice: !!live,
      updatedAt: new Date().toISOString()
    };
  });
}

async function fetchMarketPriceMap() {
  try {
    const response = await fetch(`${API_URL}/prices`);

    if (!response.ok) {
      throw new Error("Market price request failed.");
    }

    const json = await response.json();

    const list = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json?.prices)
      ? json.prices
      : Array.isArray(json)
      ? json
      : [];

    const map = new Map();

    list.forEach((item) => {
      const mastered = applySecurityMaster(item);

      if (mastered.symbol) {
        map.set(mastered.symbol, mastered);
      }
    });

    return map;
  } catch (error) {
    console.log("Portfolio revalue fallback:", error.message);
    return new Map();
  }
}