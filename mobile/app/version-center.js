import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router } from "expo-router";

import {
  APP_VERSION,
  RELEASE_DATE,
  COMPLETED_FEATURES,
  IN_PROGRESS,
  REMAINING_FEATURES
} from "../src/version/versionRegistry";

export default function VersionCenter() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Version Center</Text>

        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.replace("/(tabs)/dashboard")}
        >
          <Text style={styles.dashboardButtonText}>Dashboard</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        GateCEP build status, completed features, and remaining roadmap.
      </Text>

      <View style={styles.heroCard}>
        <Text style={styles.version}>GateCEP v{APP_VERSION}</Text>
        <Text style={styles.release}>Release Date: {RELEASE_DATE}</Text>
      </View>

      <FeatureSection
        title="Completed Features"
        items={COMPLETED_FEATURES}
        symbol="✓"
        color="#86efac"
      />

      <FeatureSection
        title="In Progress"
        items={IN_PROGRESS}
        symbol="◐"
        color="#fde68a"
      />

      <FeatureSection
        title="Remaining Features"
        items={REMAINING_FEATURES}
        symbol="□"
        color="#fca5a5"
      />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Build Notes</Text>
        <Text style={styles.body}>
          This version focuses on user-scoped storage, Coach G basket routing,
          portfolio sync, broker enrollment, and simulation-ready trade execution.
        </Text>
        <Text style={styles.body}>
          Next major milestone: real broker API connection, live NSE feed, CDS
          verification, and settlement reconciliation.
        </Text>
      </View>
    </ScrollView>
  );
}

function FeatureSection({ title, items, symbol, color }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>

      {items.map((item) => (
        <View key={item} style={styles.featureRow}>
          <Text style={[styles.symbol, { color }]}>{symbol}</Text>
          <Text style={styles.featureText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 100 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "900",
    flex: 1
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 10,
    lineHeight: 22
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
  },
  heroCard: {
    marginTop: 24,
    backgroundColor: "rgba(147,51,234,.16)",
    borderColor: "rgba(147,51,234,.45)",
    borderWidth: 1,
    borderRadius: 24,
    padding: 22
  },
  version: {
    color: "white",
    fontSize: 30,
    fontWeight: "900"
  },
  release: {
    color: "#c084fc",
    marginTop: 8,
    fontWeight: "900"
  },
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
  featureRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 8,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1
  },
  symbol: {
    fontWeight: "900",
    width: 24
  },
  featureText: {
    color: "#cbd5e1",
    flex: 1,
    lineHeight: 20
  },
  body: {
    color: "#cbd5e1",
    marginTop: 8,
    lineHeight: 21
  }
});