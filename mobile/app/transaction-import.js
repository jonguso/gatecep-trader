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

export default function TransactionImport() {
  const [form, setForm] = useState({
    symbol: "",
    side: "BUY",
    quantity: "",
    price: "",
    date: ""
  });

  const [transactions, setTransactions] = useState([]);

  function addTransaction() {
    if (!form.symbol || !form.quantity || !form.price) {
      Alert.alert("Missing Info", "Enter symbol, quantity, and price.");
      return;
    }

    const item = {
      symbol: form.symbol.trim().toUpperCase(),
      side: form.side,
      quantity: Number(form.quantity || 0),
      price: Number(form.price || 0),
      date: form.date || new Date().toISOString().slice(0, 10),
      value: Number(form.quantity || 0) * Number(form.price || 0)
    };

    setTransactions([item, ...transactions]);

    setForm({
      symbol: "",
      side: "BUY",
      quantity: "",
      price: "",
      date: ""
    });
  }

  async function saveTransactions() {
    if (!transactions.length) {
      Alert.alert("No Transactions", "Add at least one transaction.");
      return;
    }

    await AsyncStorage.setItem("gatecepTransactionsUploaded", "true");
    await AsyncStorage.setItem(
      "gatecepTransactionHistory",
      JSON.stringify(transactions)
    );

    Alert.alert("Saved", "Transaction history saved for Coach G.");

    router.replace("/dashboard");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Transaction History</Text>

      <Text style={styles.subtitle}>
        Add buy and sell activity so Coach G can understand your investing behavior.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Transaction Entry</Text>

        <TextInput
          placeholder="Symbol e.g. SCOM"
          placeholderTextColor="#64748b"
          value={form.symbol}
          onChangeText={(value) => setForm({ ...form, symbol: value })}
          autoCapitalize="characters"
          style={styles.input}
        />

        <View style={styles.sideRow}>
          {["BUY", "SELL"].map((side) => (
            <Pressable
              key={side}
              style={[styles.sideChip, form.side === side && styles.sideActive]}
              onPress={() => setForm({ ...form, side })}
            >
              <Text style={form.side === side ? styles.sideTextActive : styles.sideText}>
                {side}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          placeholder="Quantity"
          placeholderTextColor="#64748b"
          value={form.quantity}
          keyboardType="numeric"
          onChangeText={(value) => setForm({ ...form, quantity: value })}
          style={styles.input}
        />

        <TextInput
          placeholder="Price"
          placeholderTextColor="#64748b"
          value={form.price}
          keyboardType="numeric"
          onChangeText={(value) => setForm({ ...form, price: value })}
          style={styles.input}
        />

        <TextInput
          placeholder="Date YYYY-MM-DD optional"
          placeholderTextColor="#64748b"
          value={form.date}
          onChangeText={(value) => setForm({ ...form, date: value })}
          style={styles.input}
        />

        <Pressable style={styles.secondary} onPress={addTransaction}>
          <Text style={styles.secondaryText}>Add Transaction</Text>
        </Pressable>
      </View>

      {transactions.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transactions Added</Text>

          {transactions.map((t, index) => (
            <View key={`${t.symbol}-${index}`} style={styles.txRow}>
              <View>
                <Text style={styles.symbol}>{t.symbol}</Text>
                <Text style={styles.small}>
                  {t.side} • {t.quantity} shares @ KES {money(t.price)}
                </Text>
              </View>

              <Text style={t.side === "BUY" ? styles.green : styles.red}>
                KES {money(t.value)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Pressable style={styles.primary} onPress={saveTransactions}>
        <Text style={styles.primaryText}>Save Transaction History</Text>
      </Pressable>

      <Pressable style={styles.backButton} onPress={() => router.replace("/broker-upload")}>
        <Text style={styles.backText}>Back to Upload Center</Text>
      </Pressable>
    </ScrollView>
  );
}

function money(v) {
  return Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 100 },
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
    marginBottom: 14
  },
  input: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    fontSize: 16
  },
  sideRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12
  },
  sideChip: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1
  },
  sideActive: {
    backgroundColor: "#9333ea",
    borderColor: "#c084fc"
  },
  sideText: { color: "#94a3b8", textAlign: "center", fontWeight: "900" },
  sideTextActive: { color: "white", textAlign: "center", fontWeight: "900" },
  secondary: {
    marginTop: 16,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16
  },
  secondaryText: { color: "#67e8f9", textAlign: "center", fontWeight: "900" },
  txRow: {
    paddingVertical: 14,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  symbol: { color: "white", fontSize: 16, fontWeight: "900" },
  small: { color: "#94a3b8", marginTop: 4 },
  green: { color: "#86efac", fontWeight: "900" },
  red: { color: "#fca5a5", fontWeight: "900" },
  primary: {
    marginTop: 22,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18
  },
  primaryText: { color: "white", textAlign: "center", fontWeight: "900" },
  backButton: {
    marginTop: 14,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 18
  },
  backText: { color: "#cbd5e1", textAlign: "center", fontWeight: "900" }
});