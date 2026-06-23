import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "gatecep.auth.accessToken";
const AUTH_USER_KEY = "gatecep.auth.user";

export async function saveAuthSession({ accessToken, user }) {
  await AsyncStorage.multiSet([
    [AUTH_TOKEN_KEY, accessToken],
    [AUTH_USER_KEY, JSON.stringify(user)]
  ]);
}

export async function getStoredAccessToken() {
  return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function getStoredUser() {
  const raw = await AsyncStorage.getItem(AUTH_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearAuthSession() {
  await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
}