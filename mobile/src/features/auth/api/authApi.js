import { API_URL } from "../../../config/apiConfig";

export async function registerUser({ email, username, password }) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, username, password })
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

export async function getCurrentUser(accessToken) {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Session expired");
  }

  return data.user;
}