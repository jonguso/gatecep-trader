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

export async function markAllNotificationsRead(token) {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to mark all notifications read");
  }

  return response.json();
}

export async function getIntelligenceHome(token) {
  const response = await fetch(`${API_URL}/intelligence/home`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to load Intelligence Home");
  }

  return response.json();
}