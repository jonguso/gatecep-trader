import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { getCurrentSession } from "../src/auth/authStore";

export default function Index() {
  useEffect(() => {
    routeUser();
  }, []);

  async function routeUser() {
    const session = await getCurrentSession();

    if (session?.loggedIn && session?.userId) {
      router.replace("/(tabs)/dashboard");
      return;
    }

    router.replace("/login");
  }

  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color="#67e8f9" />
      <Text style={styles.text}>Loading Gatecep...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    color: "#94a3b8",
    marginTop: 12
  }
});