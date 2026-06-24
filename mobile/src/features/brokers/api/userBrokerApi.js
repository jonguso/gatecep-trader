import { API_URL } from "../../../config/apiConfig";
import { getStoredAccessToken } from "../../auth/storage/authStorage";

export async function getUserBrokers() {
  const token = await getStoredAccessToken();

  const response = await fetch(`${API_URL}/user-brokers`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Unable to load brokers");
  }

  return data.brokers || [];
}

export async function addUserBroker(payload) {
  const token = await getStoredAccessToken();

  const response = await fetch(`${API_URL}/user-brokers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Unable to add broker");
  }

  return data.broker;
}