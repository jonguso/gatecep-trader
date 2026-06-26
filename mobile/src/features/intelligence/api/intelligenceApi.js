import { API_URL } from "../../../config/apiConfig";

export async function getNotifications(token) {
  const response = await fetch(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error("Failed to load notifications");
  }

  return response.json();
}

export async function markNotificationRead(token, notificationId) {
  const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification read");
  }

  return response.json();
}