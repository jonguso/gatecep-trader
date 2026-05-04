import Constants from "expo-constants";

export const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:4000";

export const COLORS = {
  bg: "#0b0e11",
  card: "#151a21",
  border: "#263241",
  gold: "#f0b90b",
  green: "#22c55e",
  red: "#ef4444",
  white: "#ffffff",
  muted: "#9ca3af"
};
