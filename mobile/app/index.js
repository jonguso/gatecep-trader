import { useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  useEffect(() => {
    boot();
  }, []);

  async function boot() {
    const isLoggedIn = await AsyncStorage.getItem("gatecepIsLoggedIn");
    const completed = await AsyncStorage.getItem("gatecepOnboardingCompleted");

    if (isLoggedIn !== "true") {
      router.replace("/onboarding/welcome");
      return;
    }

    if (completed === "true") {
      router.replace("/(tabs)/dashboard");
      return;
    }

    router.replace("/onboarding/name");
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#020617"
      }}
    >
      <ActivityIndicator size="large" color="#67e8f9" />
    </View>
  );
}