import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import {
  fetchWatchlistMarketRows,
  generateWatchlistSignals,
  getDefaultWatchlist
} from "../src/utils/watchlistSignals";
import { buildWatchlistScores } from "../src/watchlist/watchlistScoring";

export default function Watchlist() {
  const [items, setItems] = useState([]);
  const [scoredSignals, setScoredSignals] = useState([]);

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

  const marketRows = await fetchWatchlistMarketRows(saved);
  const generated = generateWatchlistSignals(marketRows);

  setItems(saved);
  setScoredSignals(buildWatchlistScores(generated));
}

  async function resetDefault() {
  const defaults = getDefaultWatchlist();
  const marketRows = await fetchWatchlistMarketRows(defaults);
  const generated = generateWatchlistSignals(marketRows);

  await AsyncStorage.setItem("gatecepWatchlist", JSON.stringify(defaults));

  setItems(defaults);
  setScoredSignals(buildWatchlistScores(generated));
}

  async function refreshSignals() {
  if (!items.length) return;

  const marketRows = await fetchWatchlistMarketRows(items);
  const generated = generateWatchlistSignals(marketRows);

  setScoredSignals(buildWatchlistScores(generated));
}

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
      <Text style={styles.title}>Watchlist</Text>
        <Pressable
    style={styles.dashboardButton}
    onPress={() => router.replace("/(tabs)/dashboard")}
  >
    <Text style={styles.dashboardButtonText}>Dashboard</Text>
  </Pressable>
</View>
      <Text style={styles.subtitle}>
        Track selected NSE stocks and Coach G signals before buying.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coach G Signals</Text>

        {scoredSignals.map((item) => (
          <View key={item.symbol} style={styles.stockRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.small}>
                {item.name} • {item.sector}
              </Text>
              <Text style={styles.reason}>{item.reason}</Text>
            </View>

            <View style={styles.right}>
              <Text style={styles.price}>KES {money(item.currentPrice)}</Text>

              <Text style={item.changePct >= 0 ? styles.green : styles.red}>
                {item.changePct >= 0 ? "+" : ""}
                {item.changePct}%
              </Text>

              <Text style={actionStyle(item.action)}>{item.action}</Text>

              <Text style={styles.confidence}>{item.confidence}%</Text>
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

      <Pressable
        style={styles.secondary}
        onPress={() => router.replace("/coach-insights")}
      >
        <Text style={styles.secondaryText}>Back to Coach G Insights</Text>
      </Pressable>
    </ScrollView>
  );
}

function actionStyle(action) {
  if (action === "BUY") return styles.buy;
  if (action === "ACCUMULATE") return styles.accumulate;
  if (action === "INCOME") return styles.income;
  if (action === "HOLD") return styles.hold;
  return styles.caution;
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
  buy: { color: "#22c55e", fontWeight: "900", marginTop: 4 },
  accumulate: { color: "#67e8f9", fontWeight: "900", marginTop: 4 },
  income: { color: "#fbbf24", fontWeight: "900", marginTop: 4 },
  hold: { color: "#a78bfa", fontWeight: "900", marginTop: 4 },
  caution: { color: "#f87171", fontWeight: "900", marginTop: 4 },
  confidence: { color: "white", fontWeight: "900", marginTop: 2 },
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
  secondaryText: {
    color: "#67e8f9",
    textAlign: "center",
    fontWeight: "900"
  },
headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12
},

dashboardButton: {
  backgroundColor: "#1e293b",
  borderColor: "#334155",
  borderWidth: 1,
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 14
},

dashboardButtonText: {
  color: "#67e8f9",
  fontWeight: "900"
}

});