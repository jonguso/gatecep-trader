import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("gatecep_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem("gatecep_token")
  );

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

    localStorage.setItem("gatecep_token", data.token);
    localStorage.setItem("gatecep_user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    return data.user;
  }

  function logout() {
    localStorage.removeItem("gatecep_token");
    localStorage.removeItem("gatecep_user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}