import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function SmartPortfolio() {
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState([]);

  useEffect(() => {
    buildPlan();
  }, []);

  async function buildPlan() {
    const raw = await AsyncStorage.getItem("gatecepInvestorProfile");
    const saved = raw ? JSON.parse(raw) : {};

    const risk = saved.riskTolerance || "Balanced";
    const goal = saved.goal || "Build Wealth";

    let allocation = [];

    if (risk === "Conservative") {
      allocation = [
        ["ETF / Diversifier", 35],
        ["Dividend Stocks", 30],
        ["Banking", 20],
        ["Cash Reserve", 15]
      ];
    } else if (risk === "Aggressive") {
      allocation = [
        ["Growth Stocks", 40],
        ["Banking", 25],
        ["Telecom", 20],
        ["Cash Reserve", 15]
      ];
    } else {
      allocation = [
        ["Banking", 30],
        ["Telecom", 25],
        ["Dividend Stocks", 25],
        ["ETF / Diversifier", 10],
        ["Cash Reserve", 10]
      ];
    }

    if (goal === "Passive Income" || goal === "Retirement") {
      allocation = [
        ["Dividend Stocks", 35],
        ["Banking", 25],
        ["ETF / Diversifier", 25],
        ["Cash Reserve", 15]
      ];
    }

    const smartPlan = allocation.map(([name, weight]) => ({
      name,
      weight
    }));

    const completedProfile = {
      ...saved,
      onboardingCompleted: true,
      smartPortfolioCreated: true,
      smartPortfolio: smartPlan,
      createdAt: saved.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await AsyncStorage.setItem(
      "gatecepInvestorProfile",
      JSON.stringify(completedProfile)
    );

    await AsyncStorage.setItem(
      "gatecepOnboardingCompleted",
      "true"
    );

    setProfile(completedProfile);
    setPlan(smartPlan);
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Your Smart Portfolio is Ready</Text>

      <Text style={styles.subtitle}>
        Coach G built this starter allocation from your goal, experience, risk preference, and broker status.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {profile?.riskTolerance || "Balanced"} Strategy
        </Text>

        {plan.map((item) => (
          <View key={item.name} style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.weight}>{item.weight}%</Text>
          </View>
        ))}
      </View>

      {profile?.hasBroker ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Accuracy Tip</Text>
          <Text style={styles.noticeText}>
            Upload your valuation report later so Coach G can compare this smart portfolio against your real holdings.
          </Text>
        </View>
      ) : (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Broker Guidance</Text>
          <Text style={styles.noticeText}>
            Coach G can recommend brokers when you are ready to open or connect an account.
          </Text>
        </View>
      )}

      <Pressable
        style={styles.primary}
        onPress={() => router.replace("/dashboard")}
      >
        <Text style={styles.primaryText}>Continue to Dashboard</Text>
      </Pressable>
      
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 25,
    justifyContent: "center"
  },
  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "900"
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 12,
    lineHeight: 22
  },
  card: {
    marginTop: 28,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 20
  },
  cardTitle: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 14
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 12
  },
  name: {
    color: "#cbd5e1",
    fontWeight: "800"
  },
  weight: {
    color: "white",
    fontWeight: "900"
  },
  notice: {
    marginTop: 22,
    backgroundColor: "rgba(6,182,212,.10)",
    borderColor: "rgba(6,182,212,.35)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },
  noticeTitle: {
    color: "#67e8f9",
    fontWeight: "900"
  },
  noticeText: {
    color: "#cbd5e1",
    marginTop: 8,
    lineHeight: 20
  },
  primary: {
    marginTop: 28,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18
  },
  primaryText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900"
  },
  secondary: {
    marginTop: 14,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 18
  },
  secondaryText: {
    color: "#67e8f9",
    textAlign: "center",
    fontWeight: "900"
  }
});