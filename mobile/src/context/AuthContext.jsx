import React, { createContext, useContext, useEffect, useState } from "react";
import {
  saveSecureItem,
  getSecureItem,
  deleteSecureItem
} from "../services/auth/secureStorage";
import { API_URL } from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  async function restoreSession() {
    try {
      const savedUser = await getSecureItem("gatecep_user");
      const savedToken = await getSecureItem("gatecep_token");

      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      }
    } finally {
      setLoading(false);
    }
  }

  async function login(username, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!data.ok) {
      throw new Error(data.error || "Login failed");
    }

    await saveSecureItem("gatecep_token", data.token);
    await saveSecureItem("gatecep_user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    return data.user;
  }

  async function logout() {
    await deleteSecureItem("gatecep_token");
    await deleteSecureItem("gatecep_user");

    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}