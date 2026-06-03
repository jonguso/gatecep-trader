import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Alert
} from "react-native";

import { API_URL } from "../config/api";

const symbols = ["SCOM", "EQTY", "KCB", "COOP"];

export default function OrderSplitterScreen() {
  const [symbol, setSymbol] = useState("SCOM");
  const [quantity, setQuantity] = useState("5000");
  const [split, setSplit] = useState(null);

  async function generateSplit() {
    try {
      const res = await fetch(`${API_URL}/order-splitter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          symbol,
          quantity: Number(quantity)
        })
      });

      const data = await res.json();

      if (!data.ok) {
        Alert.alert("Split Failed", data.error || "Unable to split order");
        return;
      }

      setSplit(data.split);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  }

  async function executeSplitOrder() {
    try {
      const res = await fetch(`${API_URL}/child-orders/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          symbol,
          quantity: Number(quantity),
          side: "BUY"
        })
      });

      const data = await res.json();

      if (!data.ok) {
        Alert.alert("Execution Failed", data.error || "Unable to execute child orders");
        return;
      }

      Alert.alert(
        "Split Order Started",
        `${data.execution.totalChildren} child orders created for ${symbol}`
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  }
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Smart Order Splitter</Text>

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

      <View style={styles.card}>
        <Text style={styles.label}>Parent Quantity</Text>

        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          style={styles.input}
        />

        <Pressable style={styles.generateButton} onPress={generateSplit}>
          <Text style={styles.buttonText}>Generate Split</Text>
        </Pressable>

        <Pressable style={styles.executeButton} onPress={executeSplitOrder}>
          <Text style={styles.buttonText}>Execute Child Orders</Text>
        </Pressable>
      </View>

      {split && (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Split Recommendation</Text>

            <Text style={styles.meta}>Symbol: {split.symbol}</Text>
            <Text style={styles.meta}>Parent Qty: {split.parentQuantity}</Text>
            <Text style={styles.meta}>Style: {split.executionStyle}</Text>
            <Text style={styles.meta}>Broker: {split.recommendedBroker}</Text>
            <Text style={styles.meta}>
              Market Impact: {split.estimatedMarketImpact}%
            </Text>
            <Text style={styles.cyan}>
              Child Orders: {split.childOrderCount}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Child Order Schedule</Text>

            {split.childOrders.slice(0, 20).map((child) => (
              <View key={child.childId} style={styles.childRow}>
                <Text style={styles.childId}>{child.childId}</Text>
                <Text style={styles.meta}>Qty {child.quantity}</Text>
                <Text style={styles.meta}>{child.executionWindowSeconds}s</Text>
              </View>
            ))}
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
  label: {
    color: "#94a3b8",
    marginBottom: 6
  },
  input: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14
  },
  generateButton: {
    backgroundColor: "#0891b2",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10
  },
  executeButton: {
    backgroundColor: "#7c3aed",
    padding: 15,
    borderRadius: 14,
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    fontWeight: "800"
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10
  },
  meta: {
    color: "#cbd5e1",
    marginTop: 6
  },
  cyan: {
    color: "#22d3ee",
    fontWeight: "800",
    marginTop: 10
  },
  childRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    paddingVertical: 10
  },
  childId: {
    color: "white",
    fontWeight: "800"
  }
});