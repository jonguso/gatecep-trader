import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable
} from "react-native";

import { API_URL } from "../config/api";

const symbols = ["SCOM", "EQTY", "KCB", "COOP"];

export default function OrderBookScreen() {
  const [symbol, setSymbol] = useState("SCOM");
  const [book, setBook] = useState(null);

  async function loadBook(selectedSymbol = symbol) {
    try {
      const res = await fetch(`${API_URL}/order-book/${selectedSymbol}`);
      const data = await res.json();

      if (data.ok) {
        setBook(data.book);
      }
    } catch (error) {
      console.log("Order book load failed", error.message);
    }
  }

  useEffect(() => {
    loadBook();

    const interval = setInterval(loadBook, 3000);

    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Market Depth</Text>

      <View style={styles.symbolRow}>
        {symbols.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.symbolButton,
              symbol === item && styles.symbolActive
            ]}
            onPress={() => setSymbol(item)}
          >
            <Text style={styles.symbolButtonText}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
	        {book && (
        <>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Best Bid</Text>
              <Text style={styles.green}>KES {book.bestBid}</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Best Ask</Text>
              <Text style={styles.red}>KES {book.bestAsk}</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Spread</Text>
              <Text style={styles.cyan}>KES {book.spread}</Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Liquidity</Text>
              <Text style={styles.purple}>
                {book.liquidityScore}/100
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Top Bids</Text>

            {book.bids.map((level, index) => (
              <View key={index} style={styles.levelRow}>
                <Text style={styles.green}>KES {level.price}</Text>
                <Text style={styles.value}>{level.quantity}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Top Asks</Text>

            {book.asks.map((level, index) => (
              <View key={index} style={styles.levelRow}>
                <Text style={styles.red}>KES {level.price}</Text>
                <Text style={styles.value}>{level.quantity}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Market Impact</Text>
            <Text style={styles.meta}>
              Estimated impact: {book.marketImpactEstimate}%
            </Text>
          </View>
        </>
      )}
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
  symbolRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18
  },
  symbolButton: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12
  },
  symbolActive: {
    backgroundColor: "#0891b2"
  },
  symbolButtonText: {
    color: "white",
    fontWeight: "800"
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18
  },
  metricCard: {
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 16,
    width: "48%"
  },
  metricLabel: {
    color: "#94a3b8",
    marginBottom: 6
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
    marginBottom: 10
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    paddingVertical: 10
  },
  value: {
    color: "#e2e8f0",
    fontWeight: "800"
  },
  meta: {
    color: "#94a3b8"
  },
  green: {
    color: "#22c55e",
    fontWeight: "800",
    fontSize: 16
  },
  red: {
    color: "#ef4444",
    fontWeight: "800",
    fontSize: 16
  },
  cyan: {
    color: "#22d3ee",
    fontWeight: "800",
    fontSize: 16
  },
  purple: {
    color: "#a78bfa",
    fontWeight: "800",
    fontSize: 16
  }
});