import { API_URL } from "../../config/apiConfig";
import { getStoredAccessToken } from "../../features/auth/storage/authStorage";

export async function loadUnifiedPortfolio(options = {}) {
  const token = await getStoredAccessToken();
  const broker = options?.broker || "ALL";

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

  const brokerQuery =
    broker && broker !== "ALL" ? `&broker=${encodeURIComponent(broker)}` : "";

  const response = await fetch(
    `${API_URL}/user-portfolio?t=${Date.now()}${brokerQuery}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Unable to load user portfolio");
  }

  return {
    ok: true,
    source: broker,
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

export async function loadPortfolioAccounts() {
  const token = await getStoredAccessToken();

  if (!token) {
    return {
      ok: true,
      accounts: []
    };
  }

  const response = await fetch(`${API_URL}/user-portfolio/accounts`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Unable to load portfolio accounts");
  }

  return data;
}