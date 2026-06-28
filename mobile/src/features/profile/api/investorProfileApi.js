import { API_URL } from "../../../config/apiConfig";
import { getStoredAccessToken } from "../../auth/storage/authStorage";

async function authHeaders() {
  const token = await getStoredAccessToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export async function getInvestorProfile() {
  const response = await fetch(`${API_URL}/investor-profile`, {
    headers: await authHeaders()
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Could not load investor profile");
  }

  return data;
}

export async function saveInvestorProfile(profile) {
  const response = await fetch(`${API_URL}/investor-profile`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(profile)
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Could not save investor profile");
  }

  return data;
}