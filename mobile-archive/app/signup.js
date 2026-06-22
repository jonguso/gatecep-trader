import React, { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { normalizeUsername } from "../src/auth/authStore";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm: ""
  });

  async function signup() {
    try {
      const username = normalizeUsername(form.username);
      const email = String(form.email || "").trim().toLowerCase();
      const phone = String(form.phone || "").trim();
      const password = String(form.password || "").trim();
      const confirm = String(form.confirm || "").trim();

      if (!username) {
        Alert.alert("Missing Username", "Create a username for login.");
        return;
      }

      if (!email) {
        Alert.alert("Missing Email", "Enter your email address.");
        return;
      }

      if (!phone) {
        Alert.alert("Missing Phone", "Enter your phone number.");
        return;
      }

      if (!password) {
        Alert.alert("Missing Password", "Create a password.");
        return;
      }

      if (password !== confirm) {
        Alert.alert("Password Error", "Passwords do not match.");
        return;
      }

      const usersRaw = await AsyncStorage.getItem("gatecepUsers");
      const users = usersRaw ? JSON.parse(usersRaw) : [];

      const usernameExists = users.some(
        (u) => normalizeUsername(u.username) === username
      );

      if (usernameExists) {
        Alert.alert("Username Exists", "Choose another username.");
        return;
      }

      const emailExists = users.some(
        (u) => String(u.email || "").trim().toLowerCase() === email
      );

      if (emailExists) {
        Alert.alert("Email Exists", "An account with this email already exists.");
        return;
      }

      users.push({
        username,
        email,
        phone,
        password,
        createdAt: new Date().toISOString()
      });

      await AsyncStorage.setItem("gatecepUsers", JSON.stringify(users));

      Alert.alert("Account Created", "You can now log in with your username.");

      router.replace("/login");
    } catch (error) {
      Alert.alert("Signup Error", error.message || "Could not create account.");
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Account</Text>

      <Text style={styles.subtitle}>
        Start building your investment profile.
      </Text>

      <Input
        placeholder="Username"
        value={form.username}
        autoCapitalize="none"
        onChangeText={(v) =>
          setForm({
            ...form,
            username: v
          })
        }
      />

      <Input
        placeholder="Email"
        value={form.email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(v) =>
          setForm({
            ...form,
            email: v
          })
        }
      />

      <Input
        placeholder="Phone Number"
        value={form.phone}
        keyboardType="phone-pad"
        onChangeText={(v) =>
          setForm({
            ...form,
            phone: v
          })
        }
      />

      <Input
        placeholder="Password"
        secureTextEntry
        value={form.password}
        onChangeText={(v) =>
          setForm({
            ...form,
            password: v
          })
        }
      />

      <Input
        placeholder="Confirm Password"
        secureTextEntry
        value={form.confirm}
        onChangeText={(v) =>
          setForm({
            ...form,
            confirm: v
          })
        }
      />

      <Pressable style={styles.button} onPress={signup}>
        <Text style={styles.buttonText}>Create Account</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={() => router.replace("/login")}>
        <Text style={styles.login}>Already have account? Login</Text>
      </Pressable>
    </ScrollView>
  );
}

function Input(props) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#64748b"
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617"
  },

  content: {
    padding: 24,
    paddingTop: 80
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "white"
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: 10,
    marginBottom: 30
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

  secondary: {
    padding: 18,
    borderRadius: 18,
    marginTop: 12
  },

  login: {
    color: "#67e8f9",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "900"
  }
});