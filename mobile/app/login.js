import React, { useState } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  async function login() {
    const account = {
      email: form.email || "demo@gatecep.com",
      loginAt: new Date().toISOString(),
      status: "ACTIVE"
    };

    await AsyncStorage.setItem(
      "gatecepAccount",
      JSON.stringify(account)
    );

    await AsyncStorage.setItem(
      "gatecepSession",
      JSON.stringify({
        loggedIn: true,
        loginAt: new Date().toISOString()
      })
    );

    router.replace("/dashboard");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Welcome Back</Text>

      <Text style={styles.subtitle}>
        Login to continue your Gatecep investment journey.
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#64748b"
        value={form.email}
        onChangeText={(value) =>
          setForm({
            ...form,
            email: value
          })
        }
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#64748b"
        secureTextEntry
        value={form.password}
        onChangeText={(value) =>
          setForm({
            ...form,
            password: value
          })
        }
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/signup")}>
        <Text style={styles.link}>Create new account</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617"
  },
  content: {
    padding: 24,
    paddingTop: 90
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "white"
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 10,
    marginBottom: 30,
    lineHeight: 22
  },
  input: {
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    color: "white"
  },
  button: {
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18,
    marginTop: 12
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900"
  },
  link: {
    color: "#67e8f9",
    textAlign: "center",
    marginTop: 24
  }
});