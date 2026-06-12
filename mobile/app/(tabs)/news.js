import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { router } from "expo-router";

const NEWS = [
  {
    symbol: "SCOM",
    company: "Safaricom PLC",
    title: "Safaricom remains one of the most watched NSE counters",
    category: "Market",
    detail: "Coach G is tracking turnover, price movement, and telecom sector momentum."
  },
  {
    symbol: "KCB",
    company: "KCB Group PLC",
    title: "Banking sector continues to drive NSE activity",
    category: "Sector",
    detail: "Banks remain important for dividend income and balanced growth portfolios."
  },
  {
    symbol: "BAT",
    company: "BAT Kenya",
    title: "Dividend income investors continue watching BAT Kenya",
    category: "Dividend",
    detail: "High-yield counters should be reviewed together with concentration and liquidity risk."
  },
  {
    symbol: "EABL",
    company: "East African Breweries PLC",
    title: "Consumer and manufacturing names remain active",
    category: "Company",
    detail: "Coach G monitors EABL for dividend income and balanced growth suitability."
  },
  {
    symbol: "SCBK",
    company: "Standard Chartered Bank Kenya",
    title: "Large-cap banking names remain relevant for income strategies",
    category: "Dividend",
    detail: "Bank dividend counters can support long-term income portfolios."
  }
];

export default function News() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return NEWS.filter((item) => {
      const categoryMatch = category === "All" || item.category === category;

      const searchMatch =
        !q ||
        String(item.symbol).toLowerCase().includes(q) ||
        String(item.company).toLowerCase().includes(q) ||
        String(item.title).toLowerCase().includes(q);

      return categoryMatch && searchMatch;
    });
  }, [query, category]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>NSE News</Text>

        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.replace("/(tabs)/dashboard")}
        >
          <Text style={styles.dashboardButtonText}>Dashboard</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Market updates, corporate actions, dividend notes, and Coach G
        commentary.
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search news by symbol, company, or headline"
        placeholderTextColor="#64748b"
        style={styles.search}
      />

      <View style={styles.chips}>
        {["All", "Market", "Sector", "Dividend", "Company"].map((item) => (
          <Pressable
            key={item}
            style={[styles.chip, category === item && styles.chipActive]}
            onPress={() => setCategory(item)}
          >
            <Text style={category === item ? styles.chipTextActive : styles.chipText}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Market Headlines</Text>

        {filtered.map((item) => (
          <Pressable
            key={`${item.symbol}-${item.title}`}
            style={styles.newsRow}
            onPress={() => router.push(`/security/${item.symbol}`)}
          >
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>{item.symbol.slice(0, 2)}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.headline}>{item.title}</Text>
              <Text style={styles.detail}>{item.detail}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
          </Pressable>
        ))}

        {filtered.length === 0 ? (
          <Text style={styles.empty}>No market news found.</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 110 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  title: { color: "white", fontSize: 34, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 22 },
  dashboardButton: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14
  },
  dashboardButtonText: { color: "#67e8f9", fontWeight: "900" },
  search: {
    marginTop: 18,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    color: "white",
    padding: 16,
    borderRadius: 16
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14
  },
  chip: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 999
  },
  chipActive: {
    backgroundColor: "rgba(147,51,234,.25)",
    borderColor: "#9333ea"
  },
  chipText: { color: "#cbd5e1", fontWeight: "800", fontSize: 12 },
  chipTextActive: { color: "white", fontWeight: "900", fontSize: 12 },
  card: {
    marginTop: 18,
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
  newsRow: {
    flexDirection: "row",
    gap: 12,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 14
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  logoText: { color: "#67e8f9", fontWeight: "900", fontSize: 13 },
  symbol: { color: "#67e8f9", fontWeight: "900" },
  headline: { color: "white", fontWeight: "900", marginTop: 4 },
  detail: { color: "#cbd5e1", marginTop: 5, lineHeight: 19, fontSize: 12 },
  category: { color: "#fbbf24", marginTop: 6, fontWeight: "900", fontSize: 12 },
  empty: { color: "#94a3b8", marginTop: 14 }
});