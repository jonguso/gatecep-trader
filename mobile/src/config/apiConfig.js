const PROD_API_URL =
  "https://gatecep-trader-production.up.railway.app";

const DEV_API_URL =
  "http://localhost:4000";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? DEV_API_URL : PROD_API_URL);