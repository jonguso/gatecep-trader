import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getCurrentUser,
  loginUser,
  registerUser
} from "../api/authApi";

import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredUser,
  getStoredAuthUserId,
  saveAuthSession
} from "../storage/authStorage";

import {
  restorePortfolioFromCloud
} from "../../portfolio/loadUserPortfolio";

const AuthContext = createContext(null);

const USER_SCOPED_CACHE_KEYS = [
  "gatecepPortfolio",
  "gatecepImportedPortfolioDraft",
  "gatecepStatementUploaded",
  "availableCash",
  "LatestUpload",
  "latestUpload",
  "importedPortfolioDraft",
  "ImportedPortfolioDraft",
  "PendingPortfolioImport",
  "pendingPortfolioImport"
];

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    restoreSession();
  }, []);

  async function clearUserScopedCaches() {
    await AsyncStorage.multiRemove(USER_SCOPED_CACHE_KEYS);
  }

  async function restoreSession() {
    try {
      const token = await getStoredAccessToken();
      const storedUser = await getStoredUser();

      if (!token) {
        setLoading(false);
        return;
      }

      const currentUser = await getCurrentUser(token);

      setAccessToken(token);
      setUser(currentUser || storedUser);

      await restorePortfolioFromCloud();
    } catch (error) {
      await clearAuthSession();
      await clearUserScopedCaches();
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials) {
    const previousUserId = await getStoredAuthUserId();
    const result = await loginUser(credentials);

    if (previousUserId && previousUserId !== result.user.id) {
      await clearUserScopedCaches();
    }

    await saveAuthSession({
      accessToken: result.accessToken,
      user: result.user
    });

    setAccessToken(result.accessToken);
    setUser(result.user);

    await restorePortfolioFromCloud();

    return result;
  }

  async function register(payload) {
    return await registerUser(payload);
  }

  async function logout() {
    await clearAuthSession();
    await clearUserScopedCaches();

    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        loading,
        accessToken,
        user,
        isAuthenticated: Boolean(accessToken && user),
        login,
        register,
        logout,
        restoreSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}