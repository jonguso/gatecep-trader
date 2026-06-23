import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "../src/features/auth/hooks/useAuth";

export default function RegisterScreen() {
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    try {
      setLoading(true);

      await register({
        email,
        username,
        password
      });

      Alert.alert(
        "Account Created",
        "Your Gatecep account has been created. Please log in."
      );

      router.replace("/login");
    } catch (error) {
      Alert.alert(
        "Registration Failed",
        error.message || "Unable to register"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Create Gatecep Account</Text>
      <Text style={styles.subtitle}>
        Sign up to keep your profile, broker links, portfolio, and Coach G
        insights across devices.
      </Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Pressable
        style={[styles.primary, loading && styles.disabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.primaryText}>
          {loading ? "Creating Account..." : "Create Account"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondary}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.secondaryText}>Already have an account? Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    padding: 24
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 10
  },
  subtitle: {
    color: "#94a3b8",
    lineHeight: 22,
    marginBottom: 24
  },
  input: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    color: "white",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12
  },
  primary: {
    backgroundColor: "#9333ea",
    padding: 16,
    borderRadius: 16,
    marginTop: 10
  },
  disabled: {
    opacity: 0.5
  },
  primaryText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900"
  },
  secondary: {
    padding: 16,
    marginTop: 12
  },
  secondaryText: {
    color: "#67e8f9",
    textAlign: "center",
    fontWeight: "800"
  }
});