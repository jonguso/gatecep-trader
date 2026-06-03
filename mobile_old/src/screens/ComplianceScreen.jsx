import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking
} from "react-native";

import { API_URL } from "../config/api";

export default function ComplianceScreen() {
  const [compliance, setCompliance] = useState(null);

  async function loadCompliance() {
    try {
      const res = await fetch(`${API_URL}/compliance`);
      const data = await res.json();

      if (data.ok) {
        setCompliance(data.compliance);
      }
    } catch (error) {
      console.log("Compliance load failed", error.message);
    }
  }

  function openExport(path) {
    Linking.openURL(`${API_URL}${path}`);
  }

  useEffect(() => {
    loadCompliance();

    const interval = setInterval(loadCompliance, 7000);

    return () => clearInterval(interval);
  }, []);
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Compliance + Audit</Text>

      {compliance && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Surveillance Status</Text>

          <Text style={styles.cyan}>
            Total Alerts: {compliance.totalAlerts}
          </Text>

                {compliance.alerts.map((alert, index) => (
            <View key={index} style={styles.alertCard}>
              <Text style={styles.alertType}>{alert.type}</Text>

              <Text
                style={
                  alert.severity === "HIGH"
                    ? styles.red
                    : alert.severity === "MEDIUM"
                    ? styles.yellow
                    : styles.green
                }
              >
                {alert.severity}
              </Text>

              <Text style={styles.meta}>{alert.message}</Text>

              {alert.symbol && (
                <Text style={styles.meta}>Symbol: {alert.symbol}</Text>
              )}

              {alert.orderId && (
                <Text style={styles.meta}>Order: {alert.orderId}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Audit Exports</Text>

        <Pressable
          style={styles.exportButton}
          onPress={() => openExport("/exports/orders.csv")}
        >
          <Text style={styles.buttonText}>Orders CSV</Text>
        </Pressable>

        <Pressable
          style={styles.exportButton}
          onPress={() => openExport("/exports/pnl.csv")}
        >
          <Text style={styles.buttonText}>P&L CSV</Text>
        </Pressable>

        <Pressable
          style={styles.exportButton}
          onPress={() => openExport("/exports/compliance.csv")}
        >
          <Text style={styles.buttonText}>Compliance CSV</Text>
        </Pressable>

        <Pressable
          style={styles.exportButton}
          onPress={() => openExport("/exports/settlement.csv")}
        >
          <Text style={styles.buttonText}>Settlement CSV</Text>
        </Pressable>
      </View>
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
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12
  },
  alertCard: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10
  },
  alertType: {
    color: "white",
    fontWeight: "800",
    marginBottom: 4
  },
  meta: {
    color: "#94a3b8",
    marginTop: 5
  },
  cyan: {
    color: "#22d3ee",
    fontWeight: "800",
    marginBottom: 12
  },
  green: {
    color: "#22c55e",
    fontWeight: "800"
  },
  yellow: {
    color: "#facc15",
    fontWeight: "800"
  },
  red: {
    color: "#ef4444",
    fontWeight: "800"
  },
  exportButton: {
    backgroundColor: "#0891b2",
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
    marginBottom: 10
  },
  buttonText: {
    color: "white",
    fontWeight: "800"
  }
});