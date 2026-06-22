import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import ActiveUserBanner from "../../src/components/ActiveUserBanner";

import {
  NEWS_TABS,
  getNewsForTab,
  getNewsSummary
} from "../../src/news/newsHubData";

export default function News() {
  const [tab, setTab] = useState("Market");

  const rows = useMemo(() => getNewsForTab(tab), [tab]);
  const summary = useMemo(() => getNewsSummary(), []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>News</Text>

      <Text style={styles.subtitle}>
        Market news, company updates, dividends, and Coach G insights.
      </Text>

      <ActiveUserBanner />

      <View style={styles.tabRow}>
        {NEWS_TABS.map((item) => (
          <Pressable
            key={item}
            style={[styles.tabButton, tab === item && styles.activeTab]}
            onPress={() => setTab(item)}
          >
            <Text style={tab === item ? styles.activeTabText : styles.tabText}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Metric label="Market" value={summary.market} />
        <Metric label="Company" value={summary.company} />
        <Metric label="Dividends" value={summary.dividends} />
        <Metric label="Coach G" value={summary.coachG} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{tab} News</Text>

        {rows.map((item) => (
          <View key={item.id} style={styles.newsRow}>
            <View style={styles.newsTop}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>

            <Text style={styles.newsTitle}>
              {item.symbol} · {item.title}
            </Text>

            <Text style={styles.source}>{item.source}</Text>
            <Text style={styles.detail}>{item.detail}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 120 },
  title: { color: "white", fontSize: 32, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 8, lineHeight: 22 },
  tabRow: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#1e293b"
  },
  activeTab: { backgroundColor: "#9333ea" },
  tabText: { color: "#94a3b8", fontWeight: "900" },
  activeTabText: { color: "white", fontWeight: "900" },
  summaryCard: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metric: {
    width: "47%",
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 14
  },
  metricLabel: { color: "#94a3b8", fontSize: 12 },
  metricValue: { color: "white", fontWeight: "900", marginTop: 4 },
  card: {
    marginTop: 18,
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 16
  },
  cardTitle: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 12
  },
  newsRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b"
  },
  newsTop: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  category: { color: "#fbbf24", fontWeight: "900" },
  date: { color: "#94a3b8", fontSize: 12 },
  newsTitle: {
    color: "white",
    fontWeight: "900",
    marginTop: 8,
    lineHeight: 21
  },
  source: { color: "#67e8f9", marginTop: 6, fontSize: 12 },
  detail: { color: "#cbd5e1", marginTop: 6, lineHeight: 20 }
});