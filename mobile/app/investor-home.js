import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet
} from "react-native";
import { router } from "expo-router";

export default function InvestorHome() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Welcome to Gatecep</Text>

      <Text style={styles.subtitle}>
        Choose how you want to use Coach G today.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Existing Investor</Text>
        <Text style={styles.cardText}>
          For subscribed customers with broker valuation, cash, or transaction reports.
        </Text>

        <Pressable
          style={styles.primary}
          onPress={() => router.push("/existing-portal")}
        >
          <Text style={styles.primaryText}>Enter Secure Investor Portal</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>New Investor Demo</Text>
        <Text style={styles.cardText}>
          Explore sample allocations, risk levels, and investment scenarios before opening a broker account.
        </Text>

        <Pressable
          style={styles.secondary}
          onPress={() => router.push("/demo")}
        >
          <Text style={styles.secondaryText}>Explore Coach G Demo</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Need a Broker?</Text>
        <Text style={styles.cardText}>
          Learn about broker enrollment before starting serious investment analysis.
        </Text>

        <Pressable
          style={styles.secondary}
          onPress={() => router.push("/brokers")}
        >
          <Text style={styles.secondaryText}>View Broker Options</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.linkButton}
        onPress={() => router.push("/dashboard")}
      >
        <Text style={styles.linkText}>View My Checklist</Text>
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
    lineHeight: 22,
    marginBottom: 24
  },
  card: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    marginTop: 16
  },
  cardTitle: {
    color: "#67e8f9",
    fontSize: 21,
    fontWeight: "900"
  },
  cardText: {
    color: "#cbd5e1",
    marginTop: 10,
    lineHeight: 21
  },
  primary: {
    backgroundColor: "#9333ea",
    padding: 16,
    borderRadius: 16,
    marginTop: 18
  },
  primaryText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900"
  },
  secondary: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16,
    marginTop: 18
  },
  secondaryText: {
    color: "#67e8f9",
    textAlign: "center",
    fontWeight: "900"
  },
  linkButton: {
    marginTop: 24,
    padding: 14
  },
  linkText: {
    color: "#c084fc",
    textAlign: "center",
    fontWeight: "900"
  }
});