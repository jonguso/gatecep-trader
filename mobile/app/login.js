import React, { useEffect, useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Login() {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
  const session = await AsyncStorage.getItem("gatecepSession");

  if (session) {
    await AsyncStorage.setItem("gatecepIsLoggedIn", "true");

    const completed = await AsyncStorage.getItem("gatecepOnboardingCompleted");

    router.replace(
      completed === "true" ? "/(tabs)/dashboard" : "/onboarding/name"
    );
  }
}

async function login() {
  try {
    const enteredUser = String(form.username || "").trim();
    const enteredPass = String(form.password || "").trim();

    if (!enteredUser || !enteredPass) {
      Alert.alert("Missing Login", "Enter username and password.");
      return;
    }

    const normalizedUser = enteredUser.toLowerCase();

    // Demo login
    if (normalizedUser === "gatecep" && enteredPass === "demo") {

  await AsyncStorage.setItem(
    "gatecepSession",
    JSON.stringify({
      username: "Gatecep",
      loggedIn: true,
      demo: true
    })
  );

  await AsyncStorage.setItem(
    "gatecepIsLoggedIn",
    "true"
  );

  const completed =
    await AsyncStorage.getItem(
      "gatecepOnboardingCompleted"
    );

  router.replace(
    completed === "true"
      ? "/(tabs)/dashboard"
      : "/onboarding/name"
  );

  return;
}

    // Saved signup users
    const usersRaw = await AsyncStorage.getItem("gatecepUsers");
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    const user = users.find(
      (u) =>
        String(u.username || "").trim().toLowerCase() === normalizedUser &&
        String(u.password || "").trim() === enteredPass
    );

    if (user) {
     await AsyncStorage.setItem(
  "gatecepSession",
  JSON.stringify({
    username: user.username,
    email: user.email,
    loggedIn: true
  })
);

await AsyncStorage.setItem(
  "gatecepIsLoggedIn",
  "true"
);

      const completed = await AsyncStorage.getItem("gatecepOnboardingCompleted");

router.replace(
  completed === "true" ? "/(tabs)/dashboard" : "/onboarding/name"
);

      return;
    }

    Alert.alert("Login Failed", "Invalid username or password.");
  } catch (error) {
    Alert.alert("Login Error", error.message || "Login failed.");
  }
}

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Image
        source={require("../assets/gatecep-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>
  Gatecep AI
</Text>

<Text style={styles.subtitle}>
  Smarter Investing. Guided by Coach G.
</Text>
      <TextInput
        placeholder="Username"
        placeholderTextColor="#64748b"
        value={form.username}
        onChangeText={(value) => setForm({ ...form, username: value })}
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#64748b"
        secureTextEntry
        value={form.password}
        onChangeText={(value) => setForm({ ...form, password: value })}
        style={styles.input}
      />

      <Pressable
  style={({ pressed }) => [
    styles.button,
    pressed && { opacity: 0.75 }
  ]}
  onPress={login}
>
  <Text style={styles.buttonText}>Login</Text>
</Pressable>

      <Pressable style={styles.secondary} onPress={() => router.push("/signup")}>
        <Text style={styles.secondaryText}>
          Don&apos;t have an account? Sign Up
        </Text>
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
    flexGrow: 1,
    justifyContent: "center",
    padding: 28
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 24
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    color: "white"
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 12,
    marginBottom: 34,
    fontSize: 16
  },
  input: {
    backgroundColor: "#1e293b",
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
    color: "white",
    fontSize: 16
  },
  button: {
    backgroundColor: "#0891b2",
    padding: 18,
    borderRadius: 18,
    marginTop: 10
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16
  },
  secondary: {
    backgroundColor: "#1e293b",
    padding: 18,
    borderRadius: 18,
    marginTop: 14
  },
  secondaryText: {
    color: "#67e8f9",
    textAlign: "center",
    fontWeight: "900"
  }
});