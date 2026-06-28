import { API_URL } from "../../../config/apiConfig";

async function readJsonResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      ok: false,
      error: text || "Invalid server response"
    };
  }
}

export async function registerUser({ email, username, password }) {
  const url = `${API_URL}/auth/register`;
  console.log("REGISTER URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, username, password })
    });

    const data = await readJsonResponse(response);
    console.log("REGISTER RESPONSE:", response.status, data);

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Registration failed");
    }

    return data;
  } catch (error) {
    console.log("REGISTER NETWORK ERROR:", error?.message, url);
    throw error;
  }
}

export async function loginUser({ email, password }) {
  const url = `${API_URL}/auth/login`;
  console.log("LOGIN URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await readJsonResponse(response);
    console.log("LOGIN RESPONSE:", response.status, data);

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Login failed");
    }

    return data;
  } catch (error) {
    console.log("LOGIN NETWORK ERROR:", error?.message, url);
    throw error;
  }
}

export async function getCurrentUser(accessToken) {
  const url = `${API_URL}/users/me`;
  console.log("CURRENT USER URL:", url);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const data = await readJsonResponse(response);
    console.log("CURRENT USER RESPONSE:", response.status, data);

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "Session expired");
    }

    return data.user;
  } catch (error) {
    console.log("CURRENT USER NETWORK ERROR:", error?.message, url);
    throw error;
  }
}