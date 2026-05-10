import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet
} from "react-native";

import { API_URL } from "../config/api";

export default function ChildOrdersScreen() {
  const [executions, setExecutions] = useState([]);

  async function loadExecutions() {
    try {
      const res = await fetch(`${API_URL}/child-orders`);
      const data = await res.json();

      if (data.ok) {
        setExecutions(data.parentExecutions || []);
      }
    } catch (error) {
      console.log("Child orders load failed", error.message);
    }
  }

  useEffect(() => {
    loadExecutions();

    const interval = setInterval(loadExecutions, 3000);

    return () => clearInterval(interval);
  }, []);
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Child Order Monitor</Text>

      {executions.length === 0 && (
        <View style={styles.card}>
          <Text style={styles.meta}>No parent executions yet.</Text>
        </View>
      )}

      {executions.map((parent) => (
        <View key={parent.parentId} style={styles.card}>
          <Text style={styles.symbol}>
            {parent.symbol} {parent.side}
          </Text>

          <Text style={styles.meta}>{parent.parentId}</Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${parent.completionPercent}%` }
              ]}
            />
          </View>

          <Text style={styles.cyan}>
            {parent.completionPercent}% Complete
          </Text>

          <Text style={styles.meta}>
            {parent.completedChildren}/{parent.totalChildren} child orders
          </Text>

          <Text style={styles.meta}>Style: {parent.executionStyle}</Text>
          <Text style={styles.meta}>Broker: {parent.recommendedBroker}</Text>
          <Text style={styles.meta}>Status: {parent.status}</Text>

          <Text style={styles.sectionTitle}>Children</Text>

          {parent.childExecutions.map((child) => (
            <View key={child.childId} style={styles.childRow}>
              <View>
                <Text style={styles.childId}>{child.childId}</Text>
                <Text style={styles.meta}>{child.orderId}</Text>
              </View>

              <View>
                <Text style={styles.value}>Qty {child.quantity}</Text>
                <Text style={styles.cyan}>{child.status}</Text>
              </View>
            </View>
          ))}
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
  symbol: {
    color: "white",
    fontSize: 20,
    fontWeight: "800"
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 10
  },
  meta: {
    color: "#94a3b8",
    marginTop: 5
  },
  cyan: {
    color: "#22d3ee",
    fontWeight: "800",
    marginTop: 6
  },
  value: {
    color: "#e2e8f0",
    fontWeight: "800",
    textAlign: "right"
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#1e293b",
    borderRadius: 999,
    marginTop: 16,
    overflow: "hidden"
  },
  progressFill: {
    height: 8,
    backgroundColor: "#22d3ee",
    borderRadius: 999
  },
  childRow: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  childId: {
    color: "white",
    fontWeight: "800"
  }
});