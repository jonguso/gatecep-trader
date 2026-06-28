import Constants from "expo-constants";

const PROD_API_URL = "https://gatecep-trader-production.up.railway.app";

const LOCALHOST_API_URL = "http://10.0.0.168:4000";

function getExpoHostApiUrl() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  const host = String(hostUri || "").split(":")[0];

  if (!host) return LOCALHOST_API_URL;

  return `http://${host}:4000`;
}

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? getExpoHostApiUrl() : PROD_API_URL);