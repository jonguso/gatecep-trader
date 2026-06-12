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
  await logout();
}