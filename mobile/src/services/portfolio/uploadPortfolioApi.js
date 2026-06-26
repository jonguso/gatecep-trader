import { API_URL } from "../../config/apiConfig";
import { getStoredAccessToken } from "../../features/auth/storage/authStorage";

export async function loadUnifiedPortfolio(broker = "AIB") {
  const token = await getStoredAccessToken();

  if (token) {
    try {
      const response = await fetch(`${API_URL}/user-portfolio?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        return {
          source: "USER_PORTFOLIO",
          priceSource: "USER_PORTFOLIO",
          holdings: data.holdings || [],
          totalValue: data.summary?.totalValue || 0,
          totalMarketValue: data.summary?.totalValue || 0,
          totalProfitLoss: data.summary?.totalProfitLoss || 0,
          summary: data.summary || {}
        };
      }
    } catch (error) {
      console.log("User portfolio load failed:", error.message);
    }
  }

  const response = await fetch(
    `${API_URL}/broker-portfolio/${broker}?t=${Date.now()}`
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Unable to load portfolio");
  }

  return {
    ...data,
    source: data.source || "BROKER_PORTFOLIO",
    holdings: data.holdings || []
  };
}

export async function uploadConfirmedPortfolio(portfolio = []) {
  const token = await getStoredAccessToken();

  if (!token) {
    throw new Error("Authentication token missing");
  }

  const response = await fetch(`${API_URL}/user-portfolio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      holdings: portfolio
    })
  });

  const data = await response.json();

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || "Unable to upload confirmed portfolio");
  }

  return data;
}