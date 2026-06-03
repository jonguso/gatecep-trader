import React, { useCallback, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";

export default function RecommendationHistory() {
  const [history, setHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  async function loadHistory() {
    const raw = await AsyncStorage.getItem("gatecepRecommendationHistory");
    setHistory(raw ? JSON.parse(raw) : []);
  }

  async function markStatus(id, status) {
    const updated = history.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            reviewedAt: new Date().toISOString()
          }
        : item
    );

    setHistory(updated);

    await AsyncStorage.setItem(
      "gatecepRecommendationHistory",
      JSON.stringify(updated)
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Recommendation History</Text>

      <Text style={styles.subtitle}>
        Review what Coach G recommended and track whether you followed it.
      </Text>

      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No recommendations yet</Text>

          <Text style={styles.emptyText}>
            After portfolio analysis, Coach G recommendations will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {history.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {item.type || "Coach G Recommendation"}
                  </Text>

                  <Text style={styles.dateText}>
                    {formatDate(item.date)}
                  </Text>
                </View>

                <Text style={styles.score}>
                  {item.score}/100
                </Text>
              </View>

              <Text style={styles.summary}>
                {item.summary}
              </Text>

              <Text style={styles.rating}>
                Rating: {item.rating}
              </Text>

              <View style={styles.actionList}>
                {item.actions?.map((action, index) => (
                  <Text key={index} style={styles.actionText}>
                    • {action}
                  </Text>
                ))}
              </View>

              <View style={styles.statusBox}>
                <Text style={styles.statusLabel}>Status</Text>

                <Text style={styles.statusValue}>
                  {item.status || "NEW"}
                </Text>
              </View>

              <View style={styles.buttons}>
                <Pressable
                  style={styles.followed}
                  onPress={() => markStatus(item.id, "FOLLOWED")}
                >
                  <Text style={styles.buttonText}>Followed</Text>
                </Pressable>

                <Pressable
                  style={styles.pending}
                  onPress={() => markStatus(item.id, "PENDING")}
                >
                  <Text style={styles.buttonText}>Pending</Text>
                </Pressable>

                <Pressable
                  style={styles.ignored}
                  onPress={() => markStatus(item.id, "IGNORED")}
                >
                  <Text style={styles.buttonText}>Ignored</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <Pressable
        style={styles.primary}
        onPress={() => router.push("/dashboard")}
      >
        <Text style={styles.primaryText}>Back to Checklist</Text>
      </Pressable>
    </ScrollView>
  );
}

function formatDate(value) {
  if (!value) return "Unknown date";

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
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
  emptyCard: {
    marginTop: 26,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 20
  },
  emptyTitle: {
    color: "white",
    fontWeight: "900",
    fontSize: 18
  },
  emptyText: {
    color: "#94a3b8",
    marginTop: 10,
    lineHeight: 20
  },
  list: {
    marginTop: 24,
    gap: 18
  },
  card: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  cardTitle: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 17
  },
  dateText: {
    color: "#94a3b8",
    marginTop: 5,
    fontSize: 12
  },
  score: {
    color: "#c084fc",
    fontWeight: "900"
  },
  summary: {
    color: "#cbd5e1",
    marginTop: 14,
    lineHeight: 20
  },
  rating: {
    color: "#86efac",
    marginTop: 10,
    fontWeight: "900"
  },
  actionList: {
    marginTop: 12
  },
  actionText: {
    color: "#cbd5e1",
    marginTop: 6,
    lineHeight: 19
  },
  statusBox: {
    marginTop: 16,
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12
  },
  statusLabel: {
    color: "#94a3b8",
    fontSize: 12
  },
  statusValue: {
    color: "white",
    marginTop: 4,
    fontWeight: "900"
  },
  buttons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  followed: {
    flex: 1,
    backgroundColor: "rgba(34,197,94,.18)",
    padding: 12,
    borderRadius: 14
  },
  pending: {
    flex: 1,
    backgroundColor: "rgba(245,158,11,.18)",
    padding: 12,
    borderRadius: 14
  },
  ignored: {
    flex: 1,
    backgroundColor: "rgba(239,68,68,.18)",
    padding: 12,
    borderRadius: 14
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 12
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
  }
});