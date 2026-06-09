import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const brokers = [
  {
    name: "AIB-AXYS",
    reason: "Good all-round broker for new investors."
  },
  {
    name: "ABC Capital",
    reason: "Strong digital onboarding and research."
  },
  {
    name: "NCBA Investment Bank",
    reason: "Good banking integration and support."
  },
  {
    name: "Dyer & Blair",
    reason: "Popular full-service investment broker."
  }
];

export default function RecommendBroker() {
  async function selectBroker(broker) {
    await AsyncStorage.setItem(
      "gatecepRecommendedBroker",
      JSON.stringify({
        name: broker.name,
        selectedAt: new Date().toISOString()
      })
    );

    const profileRaw =
      await AsyncStorage.getItem("gatecepInvestorProfile");

    const profile = profileRaw
      ? JSON.parse(profileRaw)
      : {};

    profile.broker = {
      name: broker.name,
      source: "COACH_G_RECOMMENDATION"
    };

    await AsyncStorage.setItem(
      "gatecepInvestorProfile",
      JSON.stringify(profile)
    );

    router.push("/broker-status");
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>
        Coach G Broker Recommendation
      </Text>

      <Text style={styles.subtitle}>
        Based on your onboarding profile,
        Coach G recommends starting with one
        of the brokers below.
      </Text>

      {brokers.map((broker) => (
        <Pressable
          key={broker.name}
          style={styles.card}
          onPress={() => selectBroker(broker)}
        >
          <Text style={styles.brokerName}>
            {broker.name}
          </Text>

          <Text style={styles.reason}>
            {broker.reason}
          </Text>
        </Pressable>
      ))}

      <Pressable
        style={styles.skip}
        onPress={() =>
          router.push("/broker-status")
        }
      >
        <Text style={styles.skipText}>
          Continue Without Selecting
        </Text>
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
    padding: 24,
    paddingTop: 70,
    paddingBottom: 60
  },

  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "900"
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: 12,
    marginBottom: 24,
    lineHeight: 22
  },

  card: {
    backgroundColor: "#0f172a",
    borderColor: "#9333ea",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14
  },

  brokerName: {
    color: "#67e8f9",
    fontSize: 18,
    fontWeight: "900"
  },

  reason: {
    color: "#cbd5e1",
    marginTop: 8,
    lineHeight: 20
  },

  skip: {
    marginTop: 20,
    padding: 16
  },

  skipText: {
    color: "#94a3b8",
    textAlign: "center",
    fontWeight: "900"
  }
});