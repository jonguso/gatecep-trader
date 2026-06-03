import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router } from "expo-router";

const marketData = [
  { symbol: "SCOM", name: "Safaricom", sector: "Telecom", price: 30.6, changePct: 2.53, volume: 4200000, turnover: 128520000 },
  { symbol: "KCB", name: "KCB Group", sector: "Banking", price: 67.75, changePct: -3.34, volume: 890000, turnover: 60297500 },
  { symbol: "BAT", name: "BAT Kenya", sector: "Mfg. and Allied", price: 520, changePct: -3.22, volume: 41000, turnover: 21320000 },
  { symbol: "EABL", name: "EABL", sector: "Mfg. and Allied", price: 248, changePct: -2.45, volume: 130000, turnover: 32240000 },
  { symbol: "ABSA", name: "ABSA Bank Kenya", sector: "Banking", price: 29, changePct: -8.77, volume: 760000, turnover: 22040000 },
  { symbol: "KPLC", name: "Kenya Power", sector: "Energy and Petroleum", price: 16.1, changePct: -4.6, volume: 980000, turnover: 15778000 },
  { symbol: "GLD", name: "Gold ETF", sector: "ETF", price: 5650, changePct: -6.45, volume: 2400, turnover: 13560000 },
  { symbol: "SMWF", name: "Satrix MSCI World Feeder ETF", sector: "ETF", price: 940, changePct: 3.31, volume: 5500, turnover: 5170000 }
];

export default function Markets() {
  const [tab, setTab] = useState("gainers");

  const rows = useMemo(() => {
    if (tab === "gainers") {
      return [...marketData].filter((x) => x.changePct > 0).sort((a, b) => b.changePct - a.changePct);
    }

    if (tab === "losers") {
      return [...marketData].filter((x) => x.changePct < 0).sort((a, b) => a.changePct - b.changePct);
    }

    if (tab === "movers") {
      return [...marketData].sort((a, b) => b.turnover - a.turnover);
    }

    return marketData;
  }, [tab]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable style={styles.menuButton} onPress={() => router.push("/menu")}>
          <Text style={styles.menuButtonText}>☰</Text>
        </Pressable>

        <Text style={styles.title}>Markets</Text>

        <Pressable style={styles.alertButton} onPress={() => router.push("/menu")}>
          <Text style={styles.alertButtonText}>🔔</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        NSE market feed, movers, and Coach G market intelligence.
      </Text>

      <View style={styles.marketPulse}>
        <Text style={styles.cardTitle}>Market Pulse</Text>

        <View style={styles.grid}>
          <Metric label="Gainers" value={String(marketData.filter((x) => x.changePct > 0).length)} />
          <Metric label="Losers" value={String(marketData.filter((x) => x.changePct < 0).length)} />
          <Metric label="Turnover" value={`KES ${money(marketData.reduce((s, x) => s + x.turnover, 0))}`} />
          <Metric label="Hot Stock" value="SCOM" />
        </View>
      </View>

      <View style={styles.tabs}>
        <Chip label="Gainers" active={tab === "gainers"} onPress={() => setTab("gainers")} />
        <Chip label="Losers" active={tab === "losers"} onPress={() => setTab("losers")} />
        <Chip label="Movers" active={tab === "movers"} onPress={() => setTab("movers")} />
        <Chip label="All" active={tab === "all"} onPress={() => setTab("all")} />
      </View>

      <View style={styles.feedCard}>
        <Text style={styles.cardTitle}>Live Feed</Text>

        {rows.map((stock) => (
          <Pressable key={stock.symbol} style={styles.stockRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.symbol}>{stock.symbol}</Text>
              <Text style={styles.name}>{stock.name}</Text>
              <Text style={styles.sector}>{stock.sector}</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.price}>KES {money(stock.price)}</Text>
              <Text style={stock.changePct >= 0 ? styles.green : styles.red}>
                {stock.changePct >= 0 ? "▲" : "▼"} {stock.changePct.toFixed(2)}%
              </Text>
              <Text style={styles.turnover}>KES {money(stock.turnover)}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.coachCard}>
        <Text style={styles.cardTitle}>Coach G Market View</Text>
        <Text style={styles.body}>
          SCOM is showing positive momentum while Banking names are mixed. Avoid chasing weak sectors unless your portfolio is underweight and the stock supports your goal.
        </Text>
      </View>
    </ScrollView>
  );
}

function Chip({ label, active, onPress }) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2
  });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 18, paddingTop: 60, paddingBottom: 110 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center"
  },
  menuButtonText: { color: "white", fontSize: 22, fontWeight: "900" },
  alertButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center"
  },
  alertButtonText: { fontSize: 18 },
  title: { color: "white", fontSize: 32, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 21 },
  marketPulse: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16
  },
  cardTitle: { color: "#67e8f9", fontWeight: "900", fontSize: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  metricBox: {
    width: "47%",
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 12
  },
  metricLabel: { color: "#94a3b8", fontSize: 12 },
  metricValue: { color: "white", fontWeight: "900", marginTop: 6 },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 18 },
  chip: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  chipActive: {
    backgroundColor: "rgba(147,51,234,.25)",
    borderColor: "#9333ea"
  },
  chipText: { color: "#cbd5e1", fontWeight: "900" },
  chipTextActive: { color: "#c084fc" },
  feedCard: {
    marginTop: 18,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 14
  },
  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopColor: "#1e293b",
    borderTopWidth: 1,
    paddingVertical: 14,
    gap: 12
  },
  symbol: { color: "white", fontWeight: "900", fontSize: 17 },
  name: { color: "#cbd5e1", marginTop: 3 },
  sector: { color: "#94a3b8", marginTop: 3, fontSize: 12 },
  price: { color: "white", fontWeight: "900" },
  green: { color: "#86efac", fontWeight: "900", marginTop: 4 },
  red: { color: "#fca5a5", fontWeight: "900", marginTop: 4 },
  turnover: { color: "#94a3b8", marginTop: 4, fontSize: 12 },
  coachCard: {
    marginTop: 18,
    backgroundColor: "rgba(147,51,234,.12)",
    borderColor: "rgba(147,51,234,.35)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16
  },
  body: { color: "#cbd5e1", marginTop: 10, lineHeight: 21 }
});