import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "../src/features/auth/hooks/useAuth";

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);

      await login({
        email,
        password
      });

      router.replace("/dashboard");
    } catch (error) {
      Alert.alert(
        "Login Failed",
        error.message || "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          marginBottom: 24
        }}
      >
        Gatecep Login
      </Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 12,
          borderRadius: 8
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          padding: 12,
          marginBottom: 24,
          borderRadius: 8
        }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: "#111",
          padding: 16,
          borderRadius: 8
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: "600"
          }}
        >
          {loading ? "Logging In..." : "Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}