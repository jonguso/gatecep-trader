import AsyncStorage from "@react-native-async-storage/async-storage";

export async function logout() {
  await AsyncStorage.multiRemove([
    "gatecepAuth",
    "gatecepSession"
  ]);
}

export async function logoutAndClearDemoData() {
  await AsyncStorage.multiRemove([
    "gatecepAuth",
    "gatecepSession",
    "gatecepUser",
    "gatecepAccount",
    "gatecepInvestorProfile",
    "gatecepBrokerProfile",
    "gatecepBrokerProfileSkipped",
    "gatecepLatestUpload",
    "gatecepRecommendationHistory"
  ]);
}