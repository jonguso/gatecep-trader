import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { router } from "expo-router";

import { useAuth } from "../src/features/auth/hooks/useAuth";

export default function Index() {
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [loading, isAuthenticated]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#020617",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <ActivityIndicator size="large" color="#67e8f9" />
      <Text style={{ color: "#94a3b8", marginTop: 12 }}>
        Loading Gatecep...
      </Text>
    </View>
  );
}