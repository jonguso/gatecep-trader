import { API_URL } from "../../config/apiConfig";

export async function loadUnifiedPortfolio(broker = "AIB") {
  const response = await fetch(
    `${API_URL}/broker-portfolio/${broker}?t=${Date.now()}`,
    {
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache"
      }
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to load unified portfolio.");
  }

  const json = await response.json();

  return {
    totalMarketValue: Number(json.totalValue || 0),
    totalUnrealizedPnL: (json.holdings || []).reduce(
      (sum, h) => sum + Number(h.profitLoss || h.unrealizedPnL || 0),
      0
    ),
    totalRealizedPnL: 0,
    totalPnL: (json.holdings || []).reduce(
      (sum, h) => sum + Number(h.profitLoss || h.unrealizedPnL || 0),
      0
    ),
    brokerCount: 1,
    holdingCount: json.holdings?.length || 0,
    brokers: [
      {
        broker: json.broker || broker,
        marketValue: Number(json.totalValue || 0),
        holdings: json.holdings?.length || 0
      }
    ],
    holdings: json.holdings || [],
    source: json.source || "BROKER_VALUATION",
    priceSource: json.source || "BROKER_VALUATION",
    generatedAt: new Date().toISOString()
  };
}