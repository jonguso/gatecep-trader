import { API_URL } from "../../../config/apiConfig";
import { getAccessToken } from "../../../auth/userStorage";

export async function createInvestorDNA(payload = {}) {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}/investor-dna`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Unable to create Investor DNA");
  }

  return data;
}

export async function getInvestorDNA(userId) {
  const token = await getAccessToken();

  const response = await fetch(`${API_URL}/investor-dna/${userId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Investor DNA not found");
  }

  return data;
}