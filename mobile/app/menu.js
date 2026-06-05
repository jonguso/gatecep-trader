import React from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet
} from "react-native";
import { router } from "expo-router";

const items = [
  {
    title: "Dashboard",
    detail: "Portfolio health and Coach G summary",
    route: "/dashboard"
  },
  {
    title: "Upload Center",
    detail: "Upload valuation, statement, holdings, and order history",
    route: "/broker-upload"
  },
  {
    title: "Manual Portfolio Entry",
    detail: "Enter holdings manually",
    route: "/manual-portfolio-entry"
  },
  {
    title: "Risk Questionnaire",
    detail: "Update investor profile",
    route: "/questionnaire"
  },
  {
    title: "Recommendation History",
    detail: "Saved Coach G recommendations",
    route: "/recommendation-history"
  },
  {
    title: "Broker Education",
    detail: "Learn about broker registration",
    route: "/brokers"
  }
];

export default function Menu() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Menu</Text>

      <Text style={styles.subtitle}>
        Setup, maintenance, uploads, profile, and support actions.
      </Text>

      {items.map((item) => (
        <Pressable
          key={item.title}
          style={styles.item}
          onPress={() => router.push(item.route)}
        >
          <View>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDetail}>{item.detail}</Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}

      <Pressable
        style={styles.logout}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.logoutText}>Logout / Reset Session</Text>
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
    padding: 22,
    paddingTop: 70,
    paddingBottom: 40
  },
  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "900"
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 22
  },
  item: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  itemTitle: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 16
  },
  itemDetail: {
    color: "#94a3b8",
    marginTop: 6,
    maxWidth: 290
  },
  arrow: {
    color: "#c084fc",
    fontSize: 26,
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