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

export default function ExecutionAdvisorScreen() {
  const [symbol, setSymbol] = useState("SCOM");
  const [advice, setAdvice] = useState(null);

  async function loadAdvice(selectedSymbol = symbol) {
    try {
      const res = await fetch(
        `${API_URL}/execution-advisor/${selectedSymbol}`
      );

      const data = await res.json();

      if (data.ok) {
        setAdvice(data.advice);
      }
    } catch (error) {
      console.log("Execution advice load failed", error.message);
    }
  }

  useEffect(() => {
    loadAdvice();

    const interval = setInterval(loadAdvice, 3000);

    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Coach G Execution Advisor</Text>

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
            <Text style={styles.symbolButtonText}>{item}</Text>
          </Pressable>
        ))}
      </View>
      {advice && (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>Recommendation</Text>
            <Text style={styles.cyan}>
              {advice.recommendation}
            </Text>

            <Text style={styles.meta}>
              Confidence: {advice.confidenceScore}%
            </Text>

            <Text style={styles.meta}>
              Recommended Broker: {advice.recommendedBroker}
            </Text>
          </View>

          <View style={styles.grid}>
            <View style={styles.metricCard}>
              <Text style={styles.label}>Best Bid</Text>
              <Text style={styles.green}>
                KES {advice.bestBid}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.label}>Best Ask</Text>
              <Text style={styles.red}>
                KES {advice.bestAsk}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.label}>Spread</Text>
              <Text style={styles.cyan}>
                KES {advice.spread}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.label}>Liquidity</Text>
              <Text style={styles.purple}>
                {advice.liquidityScore}/100
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Risk Analysis
            </Text>

            <Text style={styles.meta}>
              Spread Risk: {advice.spreadRisk}
            </Text>

            <Text style={styles.meta}>
              Liquidity Risk: {advice.liquidityRisk}
            </Text>

            <Text style={styles.meta}>
              Market Impact: {advice.marketImpact}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Coach G Summary
            </Text>

            <Text style={styles.meta}>
              Coach G recommends {advice.recommendation} for {advice.symbol}
              with {advice.confidenceScore}% confidence using broker{" "}
              {advice.recommendedBroker}.
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
  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16
  },
  metricCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 16,
    width: "48%"
  },
  label: {
    color: "#94a3b8",
    marginBottom: 6
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10
  },
  meta: {
    color: "#cbd5e1",
    marginTop: 6,
    lineHeight: 22
  },
  green: {
    color: "#22c55e",
    fontSize: 20,
    fontWeight: "800"
  },
  red: {
    color: "#ef4444",
    fontSize: 20,
    fontWeight: "800"
  },
  cyan: {
    color: "#22d3ee",
    fontSize: 20,
    fontWeight: "800"
  },
  purple: {
    color: "#a78bfa",
    fontSize: 20,
    fontWeight: "800"
  }
});