import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Funds() {
  const [cash, setCash] = useState("");
  const [broker, setBroker] = useState("AIB");

  async function saveStatement() {
    const amount = Number(String(cash).replaceAll(",", ""));

    if (!Number.isFinite(amount) || amount < 0) {
      Alert.alert("Invalid Amount", "Enter available cash / trading space.");
      return;
    }

    await AsyncStorage.setItem("gatecepStatementUploaded", "true");
    await AsyncStorage.setItem("gatecepAvailableCash", String(amount));

    await AsyncStorage.setItem(
      "gatecepStatementSummary",
      JSON.stringify({
        broker,
        availableCash: amount,
        uploadedAt: new Date().toISOString(),
        source: "MANUAL_STATEMENT_ENTRY"
      })
    );

    Alert.alert("Statement Saved", "Available cash updated.");

    router.replace("/dashboard");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Funds</Text>

      <Text style={styles.subtitle}>
        Import or enter your broker cash / ledger statement to calculate
        available cash for Coach G.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Broker</Text>

        {["AIB", "ABC", "NCBA", "Dyer & Blair"].map((b) => (
          <Pressable
            key={b}
            style={[styles.option, broker === b && styles.optionActive]}
            onPress={() => setBroker(b)}
          >
            <Text style={broker === b ? styles.optionTextActive : styles.optionText}>
              {b}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cash / Trading Space</Text>

        <Text style={styles.help}>
          Enter the available cash or trading space from your broker statement.
        </Text>

        <TextInput
          placeholder="Available Cash e.g. 12500"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          value={cash}
          onChangeText={setCash}
          style={styles.input}
        />
      </View>

      <Pressable style={styles.primary} onPress={saveStatement}>
        <Text style={styles.primaryText}>Save Statement</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={() => router.replace("/dashboard")}>
        <Text style={styles.secondaryText}>Back to Dashboard</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 90 },
  title: { color: "white", fontSize: 34, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 22 },
  card: {
    marginTop: 22,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  cardTitle: {
    color: "#67e8f9",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12
  },
  option: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    marginTop: 10
  },
  optionActive: { backgroundColor: "#9333ea" },
  optionText: { color: "#cbd5e1", fontWeight: "800" },
  optionTextActive: { color: "white", fontWeight: "900" },
  help: { color: "#94a3b8", lineHeight: 20, marginBottom: 14 },
  input: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 18,
    borderRadius: 16,
    fontSize: 16
  },
  primary: {
    marginTop: 22,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18
  },
  primaryText: { color: "white", textAlign: "center", fontWeight: "900" },
  secondary: {
    marginTop: 14,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 18
  },
  secondaryText: { color: "#67e8f9", textAlign: "center", fontWeight: "900" }
});