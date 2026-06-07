import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import {
  generateWatchlistSignals,
  getDefaultWatchlist
} from "../src/utils/watchlistSignals";

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    load();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshSignals();

      const timer = setInterval(refreshSignals, 10000);

      return () => clearInterval(timer);
    }, [items])
  );

  async function load() {
    const raw = await AsyncStorage.getItem("gatecepWatchlist");
    const saved = raw ? JSON.parse(raw) : getDefaultWatchlist();

    setItems(saved);
    setSignals(generateWatchlistSignals(saved));
  }

  async function resetDefault() {
    const defaults = getDefaultWatchlist();

    await AsyncStorage.setItem("gatecepWatchlist", JSON.stringify(defaults));

    setItems(defaults);
    setSignals(generateWatchlistSignals(defaults));
  }

  function refreshSignals() {
    if (!items.length) return;
    setSignals(generateWatchlistSignals(items));
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Watchlist</Text>

      <Text style={styles.subtitle}>
        Track selected NSE stocks and Coach G signals before buying.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coach G Signals</Text>

        {signals.map((item) => (
          <View key={item.symbol} style={styles.stockRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.small}>{item.name} • {item.sector}</Text>
              <Text style={styles.reason}>{item.reason}</Text>
            </View>

            <View style={styles.right}>
              <Text style={styles.price}>KES {money(item.currentPrice)}</Text>
              <Text style={item.changePct >= 0 ? styles.green : styles.red}>
                {item.changePct >= 0 ? "+" : ""}
                {item.changePct}%
              </Text>
              <Text style={signalStyle(item.signal)}>{item.signal}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable style={styles.primary} onPress={refreshSignals}>
        <Text style={styles.primaryText}>Refresh Signals</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={resetDefault}>
        <Text style={styles.secondaryText}>Reset Default Watchlist</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={() => router.replace("/dashboard")}>
        <Text style={styles.secondaryText}>Back to Dashboard</Text>
      </Pressable>
    </ScrollView>
  );
}

function signalStyle(signal) {
  if (signal === "HOT") return styles.hot;
  if (signal === "OPPORTUNITY") return styles.opportunity;
  if (signal === "POSITIVE") return styles.green;
  if (signal === "CAUTION") return styles.red;
  return styles.watch;
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, {
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
    marginBottom: 12
  },
  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 14
  },
  symbol: { color: "white", fontWeight: "900", fontSize: 17 },
  small: { color: "#94a3b8", marginTop: 4 },
  reason: { color: "#cbd5e1", marginTop: 6, lineHeight: 19, fontSize: 12 },
  right: { alignItems: "flex-end", minWidth: 100 },
  price: { color: "white", fontWeight: "900" },
  green: { color: "#86efac", fontWeight: "900", marginTop: 4 },
  red: { color: "#fca5a5", fontWeight: "900", marginTop: 4 },
  hot: { color: "#fbbf24", fontWeight: "900", marginTop: 4 },
  opportunity: { color: "#67e8f9", fontWeight: "900", marginTop: 4 },
  watch: { color: "#c084fc", fontWeight: "900", marginTop: 4 },
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