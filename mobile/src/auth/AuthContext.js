import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import API from "../api";

const AuthContext = createContext(null);
const STORAGE_KEY = "GATECEP_AUTH_USER";
const TOKEN_KEY = "GATECEP_AUTH_TOKEN";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(TOKEN_KEY)])
      .then(([savedUser, token]) => {
        if (savedUser) setUser(JSON.parse(savedUser));
        if (token) API.defaults.headers.common.Authorization = `Bearer ${token}`;
      })
      .finally(() => setReady(true));
  }, []);

  const login = async ({ username, password }) => {
    const res = await API.post("/auth/login", { username, password });
    const nextUser = res.data.user;
    const token = res.data.token;

    setUser(nextUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    await AsyncStorage.setItem(TOKEN_KEY, token);

    API.defaults.headers.common.Authorization = `Bearer ${token}`;
    return nextUser;
  };

  const signup = async ({ tradingAccount, clientIdType, clientId, email }) => {
    const res = await API.post("/auth/signup", {
      tradingAccount,
      clientIdType,
      clientId,
      email
    });
    return res.data;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem(TOKEN_KEY);
    delete API.defaults.headers.common.Authorization;
  };

  const value = useMemo(() => ({ user, ready, login, signup, logout }), [user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
