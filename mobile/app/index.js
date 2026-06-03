import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Landing() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <StatusBar style="light" />

      <Text style={styles.logo}>GATECEP</Text>

      <Text style={styles.title}>
        Smarter Investing. Guided by Coach G.
      </Text>

      <Text style={styles.subtitle}>
        Gatecep helps you understand your portfolio, track goals, review broker
        statements, and receive AI-powered investment guidance.
      </Text>

      <View style={styles.features}>
        <Feature title="Portfolio Analysis" text="Upload valuations and understand what you own." />
        <Feature title="Coach G Guidance" text="Receive personalized advisory recommendations." />
        <Feature title="Goal Tracking" text="Continue where you left off every time you log in." />
      </View>

      <Pressable style={styles.primaryButton} onPress={() => router.push("/signup")}>
        <Text style={styles.buttonText}>Create Account</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => router.push("/login")}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
    </ScrollView>
  );
}

function Feature({ title, text }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureText}>{text}</Text>
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
    paddingTop: 72,
    paddingBottom: 40
  },
  logo: {
    color: "#67e8f9",
    fontWeight: "900",
    letterSpacing: 2
  },
  title: {
    color: "white",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 18,
    lineHeight: 44
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 16,
    fontSize: 15,
    lineHeight: 23
  },
  features: {
    marginTop: 28,
    gap: 14
  },
  featureCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },
  featureTitle: {
    color: "white",
    fontWeight: "800",
    fontSize: 16
  },
  featureText: {
    color: "#94a3b8",
    marginTop: 8,
    lineHeight: 20
  },
  primaryButton: {
    backgroundColor: "#9333ea",
    padding: 17,
    borderRadius: 18,
    marginTop: 30
  },
  secondaryButton: {
    backgroundColor: "#1e293b",
    padding: 17,
    borderRadius: 18,
    marginTop: 12
  },
  buttonText: {
    color: "white",
    fontWeight: "900",
    textAlign: "center"
  }
});
