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
  const userId = buildUserId(
    user.username || user.email || "demo"
  );

  const session = {
    userId,
    username: user.username || userId,
    email: user.email || "",
    loggedIn: true,
    demo: !!user.demo,
    loggedInAt: new Date().toISOString()
  };

  await AsyncStorage.setItem(
    "gatecepSession",
    JSON.stringify(session)
  );

  await AsyncStorage.setItem(
    "gatecepCurrentUserId",
    userId
  );

  await AsyncStorage.setItem(
    "gatecepIsLoggedIn",
    "true"
  );

  // legacy compatibility
  await AsyncStorage.setItem(
    "gatecepAuth",
    JSON.stringify(session)
  );

  return session;
}

export async function getCurrentSession() {
  const raw = await AsyncStorage.getItem("gatecepSession");

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getCurrentUserId() {
  const session = await getCurrentSession();
  return session?.userId || null;
}

export async function isLoggedIn() {
  const session = await getCurrentSession();

  return !!session?.loggedIn;
}

export async function logout() {
  await AsyncStorage.multiRemove([
    "gatecepSession",
    "gatecepCurrentUserId",
    "gatecepAuth"
  ]);

  await AsyncStorage.setItem(
    "gatecepIsLoggedIn",
    "false"
  );
}