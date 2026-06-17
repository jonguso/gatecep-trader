import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

const FILTERS = [
  "This Month",
  "Next 6 Months",
  "Last 12 Months"
];

const EVENTS = [
  {
    type: "DIVIDEND",
    company: "Safaricom",
    symbol: "SCOM",
    date: "2026-08-30",
    title: "Final Dividend Payment"
  },
  {
    type: "AGM",
    company: "KCB Group",
    symbol: "KCB",
    date: "2026-07-12",
    title: "Annual General Meeting"
  },
  {
    type: "BOOK_CLOSURE",
    company: "EABL",
    symbol: "EABL",
    date: "2026-07-25",
    title: "Dividend Book Closure"
  },
  {
    type: "RIGHTS",
    company: "Co-op Bank",
    symbol: "COOP",
    date: "2026-09-10",
    title: "Rights Issue Opens"
  }
];

export default function CalendarScreen() {
  const [filter, setFilter] = useState("This Month");

  const events = useMemo(() => {
    return EVENTS;
  }, [filter]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Market Calendar</Text>

      <Text style={styles.subtitle}>
        Dividends, AGMs, book closures, rights issues, and corporate actions.
      </Text>

      <View style={styles.filterRow}>
        {FILTERS.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.filterChip,
              filter === item && styles.filterChipActive
            ]}
            onPress={() => setFilter(item)}
          >
            <Text
              style={
                filter === item
                  ? styles.filterTextActive
                  : styles.filterText
              }
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Metric label="Events" value={String(events.length)} />
        <Metric label="Dividends" value="1" />
        <Metric label="AGMs" value="1" />
        <Metric label="Actions" value="2" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Events</Text>

        {events.map((event, index) => (
          <View key={`${event.symbol}-${index}`} style={styles.eventCard}>
            <View style={styles.eventTop}>
              <Text style={styles.eventType}>{event.type}</Text>
              <Text style={styles.eventDate}>{event.date}</Text>
            </View>

            <Text style={styles.company}>
              {event.symbol} · {event.company}
            </Text>

            <Text style={styles.eventTitle}>
              {event.title}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Coach G Dividend Planner
        </Text>

        <Text style={styles.body}>
          Upcoming versions will estimate expected dividend income from your
          actual holdings and broker-linked portfolios.
        </Text>
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
  screen: {
    flex: 1,
    backgroundColor: "#020617"
  },
  content: {
    padding: 22,
    paddingTop: 70,
    paddingBottom: 120
  },
  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "900"
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 8,
    lineHeight: 22
  },
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
  filterChipActive: {
    backgroundColor: "#9333ea"
  },
  filterText: {
    color: "#94a3b8",
    fontWeight: "900"
  },
  filterTextActive: {
    color: "white",
    fontWeight: "900"
  },
  summaryCard: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metric: {
    flex: 1,
    minWidth: 140,
    backgroundColor: "#0f172a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 14
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: 12
  },
  metricValue: {
    color: "white",
    fontWeight: "900",
    marginTop: 6
  },
  card: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 18
  },
  cardTitle: {
    color: "#67e8f9",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12
  },
  eventCard: {
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 12
  },
  eventTop: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  eventType: {
    color: "#fbbf24",
    fontWeight: "900"
  },
  eventDate: {
    color: "#94a3b8"
  },
  company: {
    color: "white",
    fontWeight: "900",
    marginTop: 8
  },
  eventTitle: {
    color: "#cbd5e1",
    marginTop: 6
  },
  body: {
    color: "#cbd5e1",
    lineHeight: 22
  }
});