import AsyncStorage from "@react-native-async-storage/async-storage";

export function normalizeUsername(username = "") {
  return String(username || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}

export function buildUserId(username = "") {
  return normalizeUsername(username) || "demo";
}

export async function saveSession(user = {}) {
  const userId = buildUserId(user.username || user.email || "demo");

  const session = {
    userId,
    username: user.username || userId,
    email: user.email || "",
    loggedIn: true,
    demo: !!user.demo,
    loggedInAt: new Date().toISOString()
  };

  await AsyncStorage.setItem("gatecepSession", JSON.stringify(session));
  await AsyncStorage.setItem("gatecepCurrentUserId", userId);
  await AsyncStorage.setItem("gatecepIsLoggedIn", "true");

  return session;
}

export async function getCurrentSession() {
  const raw = await AsyncStorage.getItem("gatecepSession");
  return raw ? JSON.parse(raw) : null;
}

export async function getCurrentUserId() {
  const session = await getCurrentSession();
  return session?.userId || null;
}

export async function logout() {
  await AsyncStorage.removeItem("gatecepSession");
  await AsyncStorage.removeItem("gatecepCurrentUserId");
  await AsyncStorage.setItem("gatecepIsLoggedIn", "false");
}