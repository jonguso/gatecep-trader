import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator
} from "react-native";

import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setError("");
      setLoading(true);

      await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gatecep Mobile</Text>
      <Text style={styles.subtitle}>Sign in to your OMS account</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </Pressable>

      <Text style={styles.demo}>
        Demo: admin/admin123, trader/trader123, risk/risk123
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    padding: 24
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: 24
  },
  input: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14
  },
  button: {
    backgroundColor: "#0891b2",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6
  },
  buttonText: {
    color: "white",
    fontWeight: "800"
  },
  error: {
    color: "#f87171",
    marginBottom: 12
  },
  demo: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 18
  }
});