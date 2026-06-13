import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet
} from "react-native";
import { router } from "expo-router";

import {
  userSetItem
} from "../../src/auth/userStorage";

export default function Welcome() {
  async function createAccount() {
    const user = {
      id: `USER-${Date.now()}`,
      authMode: "LOCAL_DEMO",
      createdAt: new Date().toISOString()
    };

    await userSetItem(
      "authUser",
      JSON.stringify(user)
    );

    await userSetItem(
      "isLoggedIn",
      "true"
    );

    await userSetItem(
      "appVersion",
      "v2.0.0"
    );

    router.push("/onboarding/name");
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.logo}>
        GATECEP
      </Text>

      <Text style={styles.title}>
        AI Investing Platform
      </Text>

      <Text style={styles.subtitle}>
        Build wealth, generate income, and invest smarter with Coach G.
      </Text>

      <Pressable
        style={styles.button}
        onPress={createAccount}
      >
        <Text style={styles.buttonText}>
          Create Account
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondary}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.secondaryText}>
          Already have an account?
        </Text>
      </Pressable>

      <Text style={styles.version}>
        Gatecep Mobile v2.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    padding: 30
  },

  logo: {
    fontSize: 48,
    fontWeight: "900",
    color: "#67e8f9"
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "white",
    marginTop: 10
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: 14,
    lineHeight: 22,
    marginBottom: 40
  },

  button: {
    backgroundColor: "#9333ea",
    padding: 20,
    borderRadius: 20
  },

  buttonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "900",
    fontSize: 16
  },

  secondary: {
    marginTop: 20
  },

  secondaryText: {
    color: "#94a3b8",
    textAlign: "center",
    fontWeight: "700"
  },

  version: {
    marginTop: 40,
    textAlign: "center",
    color: "#475569",
    fontSize: 12
  }
});