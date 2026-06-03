import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert
} from "react-native";

import { API_URL } from "../config/api";

export default function TradingScreen() {
  const [symbol, setSymbol] = useState("SCOM");
  const [side, setSide] = useState("BUY");
  const [quantity, setQuantity] = useState("100");
  const [price, setPrice] = useState("18.45");
  const [orders, setOrders] = useState([]);

  async function loadOrders() {
    try {
      const res = await fetch(`${API_URL}/order-history`);
      const data = await res.json();

      if (data.ok) {
        setOrders((data.orders || []).slice(0, 10));
      }
    } catch (error) {
      console.log("Order load failed", error.message);
    }
  }

  async function submitOrder() {
    try {
      const res = await fetch(`${API_URL}/execution/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          symbol,
          side,
          quantity: Number(quantity),
          price: Number(price)
        })
      });

      const data = await res.json();

      if (!data.ok) {
        Alert.alert("Order Failed", data.error || "Unable to submit order");
        return;
      }

      Alert.alert(
        "Order Submitted",
        `${data.order.symbol} ${data.order.side} ${data.order.quantity} submitted via ${data.order.broker}`
      );

      loadOrders();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  }

  useEffect(() => {
    loadOrders();

    const interval = setInterval(loadOrders, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mobile Trading Ticket</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Symbol</Text>
        <TextInput
          value={symbol}
          onChangeText={setSymbol}
          style={styles.input}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Side</Text>
        <View style={styles.sideRow}>
          <Pressable
            onPress={() => setSide("BUY")}
            style={[
              styles.sideButton,
              side === "BUY" && styles.buyActive
            ]}
          >
            <Text style={styles.sideText}>BUY</Text>
          </Pressable>

          <Pressable
            onPress={() => setSide("SELL")}
            style={[
              styles.sideButton,
              side === "SELL" && styles.sellActive
            ]}
          >
            <Text style={styles.sideText}>SELL</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Quantity</Text>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          style={styles.input}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Limit Price</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          style={styles.input}
          keyboardType="decimal-pad"
        />

        <Pressable
          onPress={submitOrder}
          style={[
            styles.submitButton,
            side === "BUY" ? styles.buySubmit : styles.sellSubmit
          ]}
        >
          <Text style={styles.submitText}>
            Submit {side} Order
          </Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Recent Orders</Text>

      {orders.map((order) => (
        <View key={order.id} style={styles.orderCard}>
          <View>
            <Text style={styles.orderSymbol}>
              {order.symbol} {order.side}
            </Text>

            <Text style={styles.orderMeta}>
              {order.quantity} @ KES {order.price}
            </Text>

            <Text style={styles.orderMeta}>
              Broker: {order.broker}
            </Text>
          </View>

          <Text
            style={[
              styles.orderStatus,
              order.status === "FILLED"
                ? styles.green
                : order.status === "REJECTED"
                ? styles.red
                : styles.cyan
            ]}
          >
            {order.status}
          </Text>
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
    marginBottom: 24
  },
  label: {
    color: "#94a3b8",
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 14,
    borderRadius: 14
  },
  sideRow: {
    flexDirection: "row",
    gap: 12
  },
  sideButton: {
    flex: 1,
    backgroundColor: "#1e293b",
    padding: 14,
    borderRadius: 14,
    alignItems: "center"
  },
  buyActive: {
    backgroundColor: "#16a34a"
  },
  sellActive: {
    backgroundColor: "#dc2626"
  },
  sideText: {
    color: "white",
    fontWeight: "800"
  },
  submitButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    alignItems: "center"
  },
  buySubmit: {
    backgroundColor: "#16a34a"
  },
  sellSubmit: {
    backgroundColor: "#dc2626"
  },
  submitText: {
    color: "white",
    fontWeight: "800"
  },
  sectionTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12
  },
  orderCard: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  orderSymbol: {
    color: "white",
    fontSize: 17,
    fontWeight: "700"
  },
  orderMeta: {
    color: "#94a3b8",
    marginTop: 4
  },
  orderStatus: {
    fontWeight: "800"
  },
  green: {
    color: "#22c55e"
  },
  red: {
    color: "#ef4444"
  },
  cyan: {
    color: "#22d3ee"
  }
});