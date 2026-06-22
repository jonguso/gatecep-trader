import AsyncStorage from "@react-native-async-storage/async-storage";

export async function logout() {
  await AsyncStorage.multiRemove([
    "gatecepAuth",
    "gatecepSession",
    "gatecepCurrentUserId",
    "gatecepIsLoggedIn"
  ]);
}

export async function logoutAndClearDemoData() {
  const userId = await AsyncStorage.getItem(
    "gatecepCurrentUserId"
  );

  if (userId) {
    const keys = await AsyncStorage.getAllKeys();

    const userKeys = keys.filter((key) =>
      key.startsWith(`gatecep:${userId}:`)
    );

    if (userKeys.length) {
      await AsyncStorage.multiRemove(userKeys);
    }
  }

  await logout();
}