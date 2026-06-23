import { API_URL } from "../../../config/apiConfig";
import { getStoredAccessToken } from "../../auth/storage/authStorage";

async function authHeaders() {
  const token = await getStoredAccessToken();

  if (!token) {
    throw new Error("You must be logged in.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function getUserPortfolio() {
  const response = await fetch(`${API_URL}/user-portfolio`, {
    headers: await authHeaders()
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Unable to load portfolio");
  }

  return data;
}

export async function addUserHolding(holding) {
  const response = await fetch(`${API_URL}/user-portfolio`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(holding)
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Unable to save holding");
  }

  return data.holding;
}