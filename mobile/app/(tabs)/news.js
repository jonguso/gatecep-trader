import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

const FILTERS = [
  "All",
  "My Holdings",
  "Dividends",
  "Earnings",
  "Corporate Actions",
  "Coach G"
];

const NEWS = [
  {
    category: "Dividends",
    symbol: "SCOM",
    title: "Safaricom dividend notice expected this season",
    source: "GateCEP Market Desk",
    impact: "Potential income opportunity for holders."
  },
  {
    category: "Earnings",
    symbol: "KCB",
    title: "Banking counters remain active ahead of earnings updates",
    source: "GateCEP Market Desk",
    impact: "Coach G will monitor concentration risk."
  },
  {
    category: "Corporate Actions",
    symbol: "EABL",
    title: "Manufacturing counters watchlist updated",
    source: "GateCEP Market Desk",
    impact: "Useful for diversification planning."
  },
  {
    category: "Coach G",
    symbol: "PORTFOLIO",
    title: "Coach G recommends monitoring dividend and sector exposure",
    source: "Coach G",
    impact: "Personalized alerts will use your holdings."
  }
];

export default function NewsScreen() {
  const [filter, setFilter] = useState("All");

  const rows = useMemo(() => {
    if (filter === "All") return NEWS;
    if (filter === "My Holdings") return NEWS;

    return NEWS.filter((item) => item.category === filter);
  }, [filter]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Market News</Text>

      <Text style={styles.subtitle}>
        NSE news, dividends, earnings, corporate actions, and Coach G alerts.
      </Text>

      <View style={styles.filterRow}>
        {FILTERS.map((item) => (
          <Pressable
            key={item}
            style={[styles.filterChip, filter === item && styles.filterActive]}
            onPress={() => setFilter(item)}
          >
            <Text style={filter === item ? styles.filterTextActive : styles.filterText}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{filter} News</Text>

        {rows.map((item, index) => (
          <View key={`${item.symbol}-${index}`} style={styles.newsCard}>
            <View style={styles.newsTop}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.symbol}>{item.symbol}</Text>
            </View>

            <Text style={styles.newsTitle}>{item.title}</Text>
            <Text style={styles.source}>{item.source}</Text>
            <Text style={styles.impact}>Coach G Impact: {item.impact}</Text>
          </View>
        ))}

        {rows.length === 0 ? (
          <Text style={styles.body}>No news found for this filter.</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 120 },
  title: { color: "white", fontSize: 34, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 8, lineHeight: 22 },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18
  },
  filterChip: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  filterActive: { backgroundColor: "#9333ea" },
  filterText: { color: "#94a3b8", fontWeight: "900" },
  filterTextActive: { color: "white", fontWeight: "900" },
  card: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  cardTitle: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 12
  },
  newsCard: {
    marginTop: 12,
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  newsTop: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  category: { color: "#fbbf24", fontWeight: "900" },
  symbol: { color: "#67e8f9", fontWeight: "900" },
  newsTitle: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
    marginTop: 10
  },
  source: { color: "#94a3b8", marginTop: 6 },
  impact: { color: "#cbd5e1", marginTop: 8, lineHeight: 20 },
  body: { color: "#cbd5e1", marginTop: 8 }
});