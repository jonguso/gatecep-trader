import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet
} from "react-native";
import { router } from "expo-router";

export default function Index() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Start with Coach G</Text>

      <Text style={styles.subtitle}>
        Choose how you want Gatecep to guide your investment journey.
      </Text>

      <View style={styles.cardGroup}>
        <Pressable
          onPress={() => router.push("/coachg/broker-home")}
          style={[styles.card, styles.cyanCard]}
        >
          <Text style={[styles.cardTitle, styles.cyanText]}>
            Existing Investor
          </Text>

          <Text style={styles.cardText}>
            Link your broker, upload reports, and let Coach G analyze your
            current portfolio.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/coachg/new-investor")}
          style={[styles.card, styles.purpleCard]}
        >
          <Text style={[styles.cardTitle, styles.purpleText]}>
            New Investor
          </Text>

          <Text style={styles.cardText}>
            Build a starter plan, compare brokers, and learn how to invest.
          </Text>
        </Pressable>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Advisory Only</Text>

        <Text style={styles.noticeText}>
          Gatecep currently provides portfolio guidance and investment support.
          Trade execution will come later through broker integrations.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617"
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 30
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 10,
    lineHeight: 21
  },
  cardGroup: {
    marginTop: 28,
    gap: 16
  },
  card: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1
  },
  cyanCard: {
    backgroundColor: "rgba(6, 182, 212, 0.10)",
    borderColor: "rgba(6, 182, 212, 0.35)"
  },
  purpleCard: {
    backgroundColor: "rgba(168, 85, 247, 0.10)",
    borderColor: "rgba(168, 85, 247, 0.35)"
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800"
  },
  cyanText: {
    color: "#67e8f9"
  },
  purpleText: {
    color: "#c084fc"
  },
  cardText: {
    color: "#cbd5e1",
    fontSize: 14,
    marginTop: 10,
    lineHeight: 21
  },
  notice: {
    marginTop: 24,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "rgba(34, 197, 94, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.35)"
  },
  noticeTitle: {
    color: "#86efac",
    fontWeight: "800",
    fontSize: 16
  },
  noticeText: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 20
  }
});