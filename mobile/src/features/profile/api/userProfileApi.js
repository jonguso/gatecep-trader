import { API_URL } from "../../../config/apiConfig";
import { getStoredAccessToken } from "../../auth/storage/authStorage";

export async function getUserProfile() {
  const token = await getStoredAccessToken();

  const response = await fetch(`${API_URL}/user-profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return await response.json();
}

export async function updateUserProfile(payload) {
  const token = await getStoredAccessToken();

  const response = await fetch(`${API_URL}/user-profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return await response.json();
}