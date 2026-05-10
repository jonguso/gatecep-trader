import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet
} from "react-native";

import { useAuth } from "../context/AuthContext";

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Gatecep OMS</Text>
          <Text style={styles.subtitle}>
            {user?.username} • {user?.role}
          </Text>
        </View>

        <Pressable onPress={logout} style={styles.logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Mobile Session</Text>
        <Text style={styles.cardValue}>CONNECTED</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Next Build</Text>
        <Text style={styles.cardValue}>Live Market Dashboard</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    padding: 20,
    paddingTop: 60
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "800"
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 4
  },
  logout: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12
  },
  logoutText: {
    color: "white",
    fontWeight: "700"
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16
  },
  cardLabel: {
    color: "#94a3b8",
    marginBottom: 8
  },
  cardValue: {
    color: "#22d3ee",
    fontSize: 22,
    fontWeight: "800"
  }
});