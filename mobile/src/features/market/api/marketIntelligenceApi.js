import { API_URL } from "../../../config/apiConfig";
import { getStoredAccessToken } from "../../auth/storage/authStorage";

export async function getMarketIntelligenceHome() {
  const token = await getStoredAccessToken();

  if (!token) {
    return {
      ok: false,
      source: "NO_AUTH",
      summary: null,
      coach: null,
      movers: [],
      holdings: []
    };
  }

  const response = await fetch(`${API_URL}/market-intelligence/home?t=${Date.now()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || "Unable to load market intelligence");
  }

  return data;
}