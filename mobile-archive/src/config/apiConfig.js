const PROD_API_URL =
  "https://gatecep-trader-production.up.railway.app";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost"
    ? PROD_API_URL
    : "http://localhost:4000");