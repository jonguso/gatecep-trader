import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { router } from "expo-router";
import { userGetItem } from "../src/auth/userStorage";

import { useAuth } from "../src/features/auth/hooks/useAuth";

export default function Index() {
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    routeUser();
  }, [loading, isAuthenticated]);

  async function routeUser() {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const profileRaw = await userGetItem("investorProfile");

    if (!profileRaw) {
      router.replace("/onboarding/name");
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#020617", justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#67e8f9" />
      <Text style={{ color: "#94a3b8", marginTop: 12 }}>Loading Gatecep...</Text>
    </View>
  );
}