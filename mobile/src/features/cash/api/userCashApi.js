import { API_URL } from "../../../config/apiConfig";
import { getStoredAccessToken } from "../../auth/storage/authStorage";

export async function getUserCash() {
  const token = await getStoredAccessToken();

  if (!token) {
    return {
      balances: [],
      summary: {
        totalCash: 0,
        currency: "KES"
      }
    };
  }

  const response = await fetch(`${API_URL}/user-cash?t=${Date.now()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Unable to load user cash");
  }

  return data;
}