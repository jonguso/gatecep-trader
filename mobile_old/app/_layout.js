import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";

import { AuthProvider, useAuth } from "../src/context/AuthContext";

function RootLayoutContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#020617",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <ActivityIndicator size="large" color="#22d3ee" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}