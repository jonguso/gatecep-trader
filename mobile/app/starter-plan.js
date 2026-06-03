import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function StarterPlan() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadPlan();
  }, []);

  async function loadPlan() {
    const raw = await AsyncStorage.getItem("gatecepInvestorProfile");

    if (raw) {
      setData(JSON.parse(raw));
    }
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>No starter plan found.</Text>

        <Pressable style={styles.primary} onPress={() => router.push("/new-investor")}>
          <Text style={styles.primaryText}>Create Profile</Text>
        </Pressable>
      </View>
    );
  }

  const { profile, broker, starterPlan } = data;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Detailed Starter Plan</Text>

      <Text style={styles.subtitle}>
        This is your first Coach G plan. It is advisory only and designed to
        help you start gradually.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Profile</Text>

        <Info label="Investor Type" value={profile.investorType} />
        <Info label="Risk Profile" value={profile.risk} />
        <Info label="Goal" value={profile.goal} />
        <Info label="Time Horizon" value={profile.timeHorizon} />
        <Info label="Review Frequency" value={starterPlan.reviewFrequency} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Starting Capital</Text>

        <Info
          label="Starting Amount"
          value={`KES ${money(starterPlan.startingAmount)}`}
        />

        <Info
          label="Estimated Invested"
          value={`KES ${money(starterPlan.totalInvested)}`}
        />

        <Info
          label="Cash Reserve"
          value={`KES ${money(starterPlan.cashReserve)}`}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Suggested Allocation</Text>

        {starterPlan.allocations?.map((item) => (
          <View key={item.name} style={styles.allocationRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.allocationName}>{item.name}</Text>
              <Text style={styles.allocationHint}>{item.weight}% target</Text>
            </View>

            <Text style={styles.allocationValue}>
              KES {money(item.amount)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.brokerCard}>
        <Text style={styles.cardTitle}>Broker Option</Text>

        <Text style={styles.brokerName}>{broker.name}</Text>

        <Text style={styles.bodyText}>{broker.reason}</Text>

        <Text style={styles.score}>Coach G Score: {broker.score}/100</Text>

        <Text style={styles.caution}>
          Broker enrollment is optional now. When you enroll, come back and add
          your broker profile so Gatecep can match future reports correctly.
        </Text>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Next Steps</Text>

        <Text style={styles.noticeText}>
          1. Review this starter plan.
        </Text>

        <Text style={styles.noticeText}>
          2. Enroll with a broker when ready.
        </Text>

        <Text style={styles.noticeText}>
          3. Add your broker profile after enrollment.
        </Text>

        <Text style={styles.noticeText}>
          4. Upload valuation reports only after you begin investing.
        </Text>
      </View>

      <Pressable style={styles.primary} onPress={() => router.replace("/dashboard")}>
        <Text style={styles.primaryText}>Return to Checklist</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={() => router.push("/investor-home")}>
        <Text style={styles.secondaryText}>Investor Home</Text>
      </Pressable>
    </ScrollView>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{String(value || "N/A")}</Text>
    </View>
  );
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
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
  center: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  loading: {
    color: "#cbd5e1",
    marginBottom: 20
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "900"
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 10,
    lineHeight: 22
  },
  card: {
    marginTop: 22,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },
  brokerCard: {
    marginTop: 22,
    backgroundColor: "rgba(147, 51, 234, 0.12)",
    borderColor: "rgba(147, 51, 234, 0.35)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },
  cardTitle: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 12
  },
  infoRow: {
    paddingVertical: 10,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1
  },
  infoLabel: {
    color: "#94a3b8",
    fontSize: 12
  },
  infoValue: {
    color: "white",
    fontWeight: "900",
    marginTop: 4,
    textTransform: "capitalize"
  },
  allocationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 12
  },
  allocationName: {
    color: "white",
    fontWeight: "900"
  },
  allocationHint: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 12
  },
  allocationValue: {
    color: "#86efac",
    fontWeight: "900",
    textAlign: "right"
  },
  brokerName: {
    color: "white",
    fontSize: 22,
    fontWeight: "900"
  },
  bodyText: {
    color: "#cbd5e1",
    marginTop: 10,
    lineHeight: 21
  },
  score: {
    color: "#c084fc",
    fontWeight: "900",
    marginTop: 12
  },
  caution: {
    color: "#fde68a",
    marginTop: 12,
    lineHeight: 20,
    fontSize: 13
  },
  notice: {
    marginTop: 22,
    backgroundColor: "rgba(245, 158, 11, 0.10)",
    borderColor: "rgba(245, 158, 11, 0.35)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },
  noticeTitle: {
    color: "#fde68a",
    fontWeight: "900",
    marginBottom: 8
  },
  noticeText: {
    color: "#cbd5e1",
    marginTop: 6,
    lineHeight: 20
  },
  primary: {
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18,
    marginTop: 24,
    width: "100%"
  },
  primaryText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900"
  },
  secondary: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 18,
    marginTop: 14
  },
  secondaryText: {
    color: "#67e8f9",
    textAlign: "center",
    fontWeight: "900"
  }
});