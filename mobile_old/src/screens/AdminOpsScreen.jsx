import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable
} from "react-native";

import { API_URL } from "../config/api";

export default function AdminOpsScreen() {
  const [admin, setAdmin] = useState(null);
  const [brokers, setBrokers] = useState([]);
  const [fixSessions, setFixSessions] = useState([]);

  async function loadOps() {
    try {
      const [adminRes, brokersRes, fixRes] = await Promise.all([
        fetch(`${API_URL}/admin/dashboard`),
        fetch(`${API_URL}/broker-accounts`),
        fetch(`${API_URL}/fix/sessions`)
      ]);

      const adminData = await adminRes.json();
      const brokersData = await brokersRes.json();
      const fixData = await fixRes.json();

      if (adminData.ok) setAdmin(adminData.dashboard);
      if (brokersData.ok) setBrokers(brokersData.accounts || []);
      if (fixData.ok) setFixSessions(fixData.sessions || []);
    } catch (error) {
      console.log("Admin ops load failed", error.message);
    }
  }

  async function setPreferredBroker(broker) {
    await fetch(`${API_URL}/broker-accounts/preferred`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ broker })
    });

    loadOps();
  }

  useEffect(() => {
    loadOps();

    const interval = setInterval(loadOps, 7000);

    return () => clearInterval(interval);
  }, []);
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin + Broker Ops</Text>

      {admin && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>System Status</Text>

          <Text style={styles.green}>{admin.systemStatus}</Text>

          <Text style={styles.meta}>
            Orders: {admin.executionSummary.totalOrders}
          </Text>

          <Text style={styles.meta}>
            Fill Rate: {admin.executionSummary.fillRate}%
          </Text>

          <Text style={styles.meta}>
            Rejected: {admin.executionSummary.rejectedOrders}
          </Text>

          <Text style={styles.meta}>
            Buying Power: KES {admin.portfolioSummary.buyingPower}
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Broker Accounts</Text>

      {brokers.map((broker) => (
  <View key={broker.broker} style={styles.rowCard}>
    <View>
      <Text style={styles.symbol}>{broker.broker}</Text>
      <Text style={styles.meta}>{broker.accountNumber}</Text>
      <Text style={styles.meta}>Cash: KES {broker.cashBalance}</Text>
      <Text style={styles.meta}>
        Buying Power: KES {broker.buyingPower}
      </Text>
    </View>

    <View style={{ alignItems: "flex-end" }}>
      <Text style={broker.preferred ? styles.green : styles.meta}>
        {broker.preferred ? "Preferred" : "Available"}
      </Text>

      {!broker.preferred && (
        <Pressable
          style={styles.smallButton}
          onPress={() => setPreferredBroker(broker.broker)}
        >
          <Text style={styles.smallButtonText}>Set</Text>
        </Pressable>
      )}
    </View>
  </View>
))}

      <Text style={styles.sectionTitle}>FIX Sessions</Text>

      {fixSessions.map((session) => (
        <View key={session.sessionId} style={styles.rowCard}>
          <View>
            <Text style={styles.symbol}>{session.broker}</Text>
            <Text style={styles.meta}>{session.sessionId}</Text>
            <Text style={styles.meta}>
              Latency: {session.heartbeatLatencyMs} ms
            </Text>
          </View>

          <Text style={styles.green}>{session.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 55,
    paddingHorizontal: 16
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 18
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16
  },
  rowCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10
  },
  symbol: {
    color: "white",
    fontSize: 18,
    fontWeight: "800"
  },
  meta: {
    color: "#94a3b8",
    marginTop: 4
  },
  green: {
    color: "#22c55e",
    fontWeight: "800",
    marginTop: 4
  },
  smallButton: {
    backgroundColor: "#0891b2",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10
  },
  smallButtonText: {
    color: "white",
    fontWeight: "800"
  }
});