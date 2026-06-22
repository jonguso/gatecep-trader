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
  CALENDAR_TABS,
  getCalendarEvents,
  getCalendarSummary
} from "../../src/calendar/calendarHubData";

export default function Calendar() {
  const [tab, setTab] = useState("This Month");

  const events = useMemo(
    () => getCalendarEvents(tab),
    [tab]
  );

  const summary = useMemo(
    () => getCalendarSummary(events),
    [events]
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Calendar</Text>

      <Text style={styles.subtitle}>
        Dividends, AGMs, earnings, treasury bills and market events
      </Text>

      <ActiveUserBanner />

      <View style={styles.tabRow}>
        {CALENDAR_TABS.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.tabButton,
              tab === item && styles.activeTab
            ]}
            onPress={() => setTab(item)}
          >
            <Text
              style={
                tab === item
                  ? styles.activeTabText
                  : styles.tabText
              }
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Metric
          label="Events"
          value={summary.total}
        />

        <Metric
          label="Dividends"
          value={summary.dividends}
        />

        <Metric
          label="AGMs"
          value={summary.agms}
        />

        <Metric
          label="Actions"
          value={summary.actions}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Upcoming Events
        </Text>

        {events.map((event) => (
          <View
            key={event.id}
            style={styles.eventRow}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>
                {event.title}
              </Text>

              <Text style={styles.eventCompany}>
                {event.company}
              </Text>

              <Text style={styles.eventDetail}>
                {event.detail}
              </Text>
            </View>

            <View style={styles.dateBox}>
              <Text style={styles.eventType}>
                {event.type}
              </Text>

              <Text style={styles.eventDate}>
                {event.date}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Event Categories
        </Text>

        <Category title="Dividends" />
        <Category title="AGMs" />
        <Category title="Earnings" />
        <Category title="Rights Issues" />
        <Category title="Treasury Bills" />
        <Category title="Bond Auctions" />
      </View>
    </ScrollView>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>
        {label}
      </Text>

      <Text style={styles.metricValue}>
        {value}
      </Text>
    </View>
  );
}

function Category({ title }) {
  return (
    <View style={styles.categoryRow}>
      <Text style={styles.categoryText}>
        {title}
      </Text>
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
    fontSize: 32,
    fontWeight: "900"
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: 8
  },

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

  activeTab: {
    backgroundColor: "#9333ea"
  },

  tabText: {
    color: "#94a3b8",
    fontWeight: "900"
  },

  activeTabText: {
    color: "white",
    fontWeight: "900"
  },

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

  metricLabel: {
    color: "#94a3b8",
    fontSize: 12
  },

  metricValue: {
    color: "white",
    fontWeight: "900",
    marginTop: 4
  },

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

  eventRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b"
  },

  eventTitle: {
    color: "white",
    fontWeight: "900"
  },

  eventCompany: {
    color: "#67e8f9",
    marginTop: 4
  },

  eventDetail: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 12
  },

  dateBox: {
    alignItems: "flex-end"
  },

  eventType: {
    color: "#fbbf24",
    fontWeight: "900",
    fontSize: 11
  },

  eventDate: {
    color: "white",
    marginTop: 6,
    fontWeight: "900",
    fontSize: 12
  },

  categoryRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b"
  },

  categoryText: {
    color: "white",
    fontWeight: "900"
  }
});