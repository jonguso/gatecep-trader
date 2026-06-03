import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Linking
} from "react-native";
import { router } from "expo-router";

const brokers = [
  {
    name: "AIB-AXYS Africa",
    shortName: "AIB",
    bestFor: "Broad NSE access and active investors",
    note: "Good option for investors who want a traditional broker relationship.",
    url: "https://www.aib-axysafrica.com/"
  },
  {
    name: "ABC Capital",
    shortName: "ABC",
    bestFor: "Bank-linked investment services",
    note: "Useful for investors who prefer broker services connected to banking relationships.",
    url: "https://abccapital.co.ke/"
  },
  {
    name: "NCBA Investment Bank",
    shortName: "NCBA",
    bestFor: "Banking + investment ecosystem",
    note: "Good fit for investors who already bank with NCBA or prefer institutional support.",
    url: "https://www.ncbagroup.com/"
  },
  {
    name: "Dyer & Blair",
    shortName: "D&B",
    bestFor: "Experienced market participants",
    note: "Established Kenyan brokerage and investment banking brand.",
    url: "https://dyerandblair.com/"
  },
  {
    name: "Faida Investment Bank",
    shortName: "Faida",
    bestFor: "Retail and advisory investors",
    note: "Another option for investors comparing Kenyan broker services.",
    url: "https://fib.co.ke/"
  },
  {
    name: "Genghis Capital",
    shortName: "Genghis",
    bestFor: "Digital-friendly investors",
    note: "Worth reviewing for investors comparing modern investment platforms.",
    url: "https://genghis-capital.com/"
  }
];

export default function Brokers() {
  async function openBroker(url) {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      Linking.openURL(url);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Broker Education</Text>

      <Text style={styles.subtitle}>
        To move from Coach G demo to real portfolio analysis, you need a broker account and valuation reports.
      </Text>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>How this fits together</Text>

        <Text style={styles.noticeText}>
          1. Open or use an existing broker account.
        </Text>

        <Text style={styles.noticeText}>
          2. Download valuation, cash, and transaction reports.
        </Text>

        <Text style={styles.noticeText}>
          3. Upload securely through the Investor Portal.
        </Text>

        <Text style={styles.noticeText}>
          4. Coach G analyzes your real portfolio.
        </Text>
      </View>

      {brokers.map((broker) => (
        <View key={broker.name} style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{broker.shortName}</Text>
          </View>

          <Text style={styles.cardTitle}>{broker.name}</Text>

          <Text style={styles.label}>Best for</Text>
          <Text style={styles.body}>{broker.bestFor}</Text>

          <Text style={styles.label}>Coach G note</Text>
          <Text style={styles.body}>{broker.note}</Text>

          <Pressable
            style={styles.secondary}
            onPress={() => openBroker(broker.url)}
          >
            <Text style={styles.secondaryText}>Visit Broker Website</Text>
          </Pressable>
        </View>
      ))}

      <Pressable
        style={styles.primary}
        onPress={() => router.push("/existing-portal")}
      >
        <Text style={styles.primaryText}>I Already Have a Broker</Text>
      </Pressable>

      <Pressable
        style={styles.linkButton}
        onPress={() => router.push("/investor-home")}
      >
        <Text style={styles.linkText}>Back to Investor Home</Text>
      </Pressable>
    </ScrollView>
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
    paddingBottom: 40
  },
  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "900"
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 10,
    lineHeight: 22
  },
  notice: {
    marginTop: 24,
    backgroundColor: "rgba(245,158,11,.12)",
    borderColor: "rgba(245,158,11,.35)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  noticeTitle: {
    color: "#fde68a",
    fontWeight: "900",
    fontSize: 18
  },
  noticeText: {
    color: "#cbd5e1",
    marginTop: 8,
    lineHeight: 20
  },
  card: {
    marginTop: 18,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(6,182,212,.16)",
    borderColor: "rgba(6,182,212,.35)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12
  },
  badgeText: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 12
  },
  cardTitle: {
    color: "white",
    fontWeight: "900",
    fontSize: 21
  },
  label: {
    color: "#67e8f9",
    fontWeight: "900",
    marginTop: 14,
    fontSize: 12,
    textTransform: "uppercase"
  },
  body: {
    color: "#cbd5e1",
    marginTop: 6,
    lineHeight: 20
  },
  primary: {
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18,
    marginTop: 26
  },
  primaryText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900"
  },
  secondary: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 16,
    marginTop: 18
  },
  secondaryText: {
    color: "#67e8f9",
    textAlign: "center",
    fontWeight: "900"
  },
  linkButton: {
    marginTop: 20,
    padding: 14
  },
  linkText: {
    color: "#c084fc",
    textAlign: "center",
    fontWeight: "900"
  }
});