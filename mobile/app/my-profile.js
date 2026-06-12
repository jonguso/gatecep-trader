import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import {
  getCurrentSession,
  logout
} from "../src/auth/authStore";
import {
  userGetItem
} from "../src/auth/userStorage";
import { loadPortfolio } from "../src/portfolio/portfolioStore";

export default function MyProfile() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [broker, setBroker] = useState(null);
  const [cash, setCash] = useState(0);
  const [portfolioValue, setPortfolioValue] = useState(0);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    const currentSession = await getCurrentSession();
    const profileRaw = await userGetItem("investorProfile");
    const brokerRaw = await userGetItem("brokerProfile");
    const cashRaw = await userGetItem("availableCash");
    const holdings = await loadPortfolio({ revalue: true });

    setSession(currentSession);
    setProfile(profileRaw ? JSON.parse(profileRaw) : null);
    setBroker(brokerRaw ? JSON.parse(brokerRaw) : null);
    setCash(Number(cashRaw || 0));

    setPortfolioValue(
      holdings.reduce(
        (sum, h) => sum + Number(h.marketValue || h.value || 0),
        0
      )
    );
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Profile</Text>

        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.replace("/(tabs)/dashboard")}
        >
          <Text style={styles.dashboardButtonText}>Dashboard</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Account, investor profile, broker status, and portfolio summary.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>

        <Info label="Username" value={session?.username || session?.userId || "N/A"} />
        <Info label="Email" value={session?.email || "N/A"} />
        <Info label="User ID" value={session?.userId || "N/A"} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Investor Profile</Text>

        <Info label="Name" value={profile?.name || profile?.fullName || "Not set"} />
        <Info label="Goal" value={profile?.goal || "Not set"} />
        <Info label="Risk" value={profile?.riskTolerance || "Not set"} />
        <Info label="Experience" value={profile?.experience || "Not set"} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Broker</Text>

        <Info
          label="Status"
          value={broker ? "Connected / Profile Added" : "No broker connected"}
        />
        <Info label="Broker" value={broker?.broker || broker?.name || "N/A"} />
        <Info label="Account" value={broker?.accountNumber || "N/A"} />

        <Pressable
          style={styles.secondary}
          onPress={() => router.push("/broker-profile")}
        >
          <Text style={styles.secondaryText}>Update Broker Profile</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Portfolio Summary</Text>

        <Info label="Available Cash" value={`KES ${money(cash)}`} />
        <Info label="Portfolio Value" value={`KES ${money(portfolioValue)}`} />

        <Pressable
          style={styles.secondary}
          onPress={() => router.push("/portfolio-command-center")}
        >
          <Text style={styles.secondaryText}>Open Command Center</Text>
        </Pressable>
      </View>

      <Pressable style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
    paddingBottom: 100
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
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
  dashboardButton: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14
  },
  dashboardButtonText: {
    color: "#67e8f9",
    fontWeight: "900"
  },
  card: {
    marginTop: 20,
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
  infoRow: {
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 12
  },
  infoLabel: {
    color: "#94a3b8",
    fontSize: 12
  },
  infoValue: {
    color: "white",
    fontWeight: "900",
    marginTop: 4
  },
  secondary: {
    marginTop: 16,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16
  },
  secondaryText: {
    color: "#67e8f9",
    textAlign: "center",
    fontWeight: "900"
  },
  logout: {
    marginTop: 24,
    backgroundColor: "rgba(239,68,68,.12)",
    borderColor: "rgba(239,68,68,.35)",
    borderWidth: 1,
    padding: 16,
    borderRadius: 18
  },
  logoutText: {
    color: "#fca5a5",
    textAlign: "center",
    fontWeight: "900"
  }
});