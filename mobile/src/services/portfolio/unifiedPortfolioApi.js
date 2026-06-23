import { API_URL } from "../../config/apiConfig";
import { getStoredAccessToken } from "../../features/auth/storage/authStorage";

export async function loadUnifiedPortfolio() {
  const token = await getStoredAccessToken();

  if (!token) {
    return {
      ok: true,
      source: "NO_AUTH",
      holdings: [],
      totalValue: 0,
      totalMarketValue: 0,
      totalProfitLoss: 0,
      summary: {
        totalHoldings: 0,
        totalValue: 0,
        totalProfitLoss: 0
      }
    };
  }

  const response = await fetch(`${API_URL}/user-portfolio?t=${Date.now()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Unable to load user portfolio");
  }

  return {
    ok: true,
    source: "USER_PORTFOLIO",
    priceSource: "USER_PORTFOLIO",
    holdings: data.holdings || [],
    totalValue: data.summary?.totalValue || 0,
    totalMarketValue: data.summary?.totalValue || 0,
    totalProfitLoss: data.summary?.totalProfitLoss || 0,
    summary: data.summary || {
      totalHoldings: 0,
      totalValue: 0,
      totalProfitLoss: 0
    }
  };
}