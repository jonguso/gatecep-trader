import { API_URL } from "../../../config/apiConfig";

export async function getCoachDashboard(token) {
  const response = await fetch(`${API_URL}/coach/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to load Coach Dashboard");
  }

  return response.json();
}