import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router } from "expo-router";

const EVENTS = [
  {
    symbol: "BAT",
    company: "BAT Kenya",
    type: "Dividend Payment",
    date: "2026-07-15",
    detail: "Estimated final dividend payment date."
  },
  {
    symbol: "SCBK",
    company: "Standard Chartered Bank Kenya",
    type: "Book Closure",
    date: "2026-06-28",
    detail: "Register closes for dividend eligibility."
  },
  {
    symbol: "KCB",
    company: "KCB Group PLC",
    type: "AGM",
    date: "2026-08-10",
    detail: "Annual general meeting event placeholder."
  },
  {
    symbol: "SCOM",
    company: "Safaricom PLC",
    type: "Results Announcement",
    date: "2026-08-22",
    detail: "Expected market update / results event placeholder."
  },
  {
    symbol: "EABL",
    company: "East African Breweries PLC",
    type: "Dividend Watch",
    date: "2026-09-05",
    detail: "Coach G dividend monitoring event."
  }
];

export default function Calendar() {
  const [filter, setFilter] = useState("All");

  const events = useMemo(() => {
    return EVENTS.filter((item) => filter === "All" || item.type === filter)
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filter]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>NSE Calendar</Text>

        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.replace("/(tabs)/dashboard")}
        >
          <Text style={styles.dashboardButtonText}>Dashboard</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Book closures, dividend payments, AGMs, and results dates.
      </Text>

      <View style={styles.chips}>
        {[
          "All",
          "Dividend Payment",
          "Book Closure",
          "AGM",
          "Results Announcement",
          "Dividend Watch"
        ].map((item) => (
          <Pressable
            key={item}
            style={[styles.chip, filter === item && styles.chipActive]}
            onPress={() => setFilter(item)}
          >
            <Text style={filter === item ? styles.chipTextActive : styles.chipText}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Market Events</Text>

        {events.map((item) => (
          <Pressable
            key={`${item.symbol}-${item.type}-${item.date}`}
            style={styles.eventRow}
            onPress={() => router.push(`/security/${item.symbol}`)}
          >
            <View style={styles.dateBox}>
              <Text style={styles.month}>
                {new Date(item.date).toLocaleString(undefined, { month: "short" })}
              </Text>
              <Text style={styles.day}>{new Date(item.date).getDate()}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.eventTitle}>{item.type}</Text>
              <Text style={styles.company}>{item.company}</Text>
              <Text style={styles.detail}>{item.detail}</Text>
            </View>
          </Pressable>
        ))}

        {events.length === 0 ? (
          <Text style={styles.empty}>No calendar events found.</Text>
        ) : null}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>POC Note</Text>
        <Text style={styles.noteText}>
          These are starter events for the proof of concept. Later this page can
          connect to NSE announcements, licensed market feeds, broker corporate
          actions, or issuer investor relations updates.
        </Text>
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
  title: { color: "white", fontSize: 31, fontWeight: "900" },
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18
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
  eventRow: {
    flexDirection: "row",
    gap: 14,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 14
  },
  dateBox: {
    width: 58,
    height: 62,
    borderRadius: 18,
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  month: { color: "#67e8f9", fontWeight: "900", fontSize: 12 },
  day: { color: "white", fontWeight: "900", fontSize: 22, marginTop: 2 },
  symbol: { color: "#67e8f9", fontWeight: "900" },
  eventTitle: { color: "white", fontWeight: "900", marginTop: 4 },
  company: { color: "#94a3b8", marginTop: 3 },
  detail: { color: "#cbd5e1", marginTop: 5, lineHeight: 19, fontSize: 12 },
  note: {
    marginTop: 18,
    backgroundColor: "rgba(6,182,212,.10)",
    borderColor: "rgba(6,182,212,.35)",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16
  },
  noteTitle: { color: "#67e8f9", fontWeight: "900" },
  noteText: { color: "#cbd5e1", marginTop: 8, lineHeight: 20 },
  empty: { color: "#94a3b8", marginTop: 14 }
});