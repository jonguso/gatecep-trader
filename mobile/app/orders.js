import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import ActiveUserBanner from "../src/components/ActiveUserBanner";
import {
  cancelExecutionOrder,
  createBasketExecution,
  loadBasketExecution,
  queueExecutionOrders,
  updateExecutionOrder
} from "../src/trade/basketExecutionStore";

export default function Orders() {
  const [execution, setExecution] = useState(null);
  const [tab, setTab] = useState("Pending");
  const [query, setQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    let saved = await loadBasketExecution();

    if (!saved) {
      saved = await createBasketExecution();
    }

    setExecution(saved);
  }

  const orders = execution?.orders || [];

  const visibleOrders = useMemo(() => {
    const search = query.trim().toLowerCase();

    return orders
      .filter((order) => {
        if (tab === "Pending") return order.status === "PENDING";
        if (tab === "Queued") return order.status === "QUEUED";
        if (tab === "Filled") return order.status === "FILLED";
        if (tab === "Cancelled") return order.status === "CANCELLED";
        return true;
      })
      .filter((order) => {
        if (!search) return true;

        return (
          String(order.symbol || "").toLowerCase().includes(search) ||
          String(order.name || "").toLowerCase().includes(search) ||
          String(order.side || "").toLowerCase().includes(search)
        );
      });
  }, [orders, tab, query]);

  const pendingOrders = orders.filter((order) => order.status === "PENDING");
  const queuedOrders = orders.filter((order) => order.status === "QUEUED");
  const filledOrders = orders.filter((order) => order.status === "FILLED");

  async function updateOrder(order, patch) {
    const updated = await updateExecutionOrder(order.id, patch);
    setExecution(updated);
  }

  async function cancelOrder(order) {
    if (order.status !== "PENDING") {
      Alert.alert("Cannot Cancel", "Only pending orders can be cancelled here.");
      return;
    }

    const updated = await cancelExecutionOrder(order.id);
    setExecution(updated);
  }

  async function confirmQueue() {
    if (!pendingOrders.length) {
      Alert.alert("No Pending Orders", "There are no pending orders to queue.");
      return;
    }

    Alert.alert(
      "Queue Basket Orders",
      `${pendingOrders.length} pending orders will be queued for execution.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Queue Orders",
          onPress: async () => {
            const updated = await queueExecutionOrders();
            setExecution(updated);
            router.push("/basket-execution");
          }
        }
      ]
    );
  }

  if (!execution || !orders.length) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Orders Review</Text>
        <Text style={styles.subtitle}>
          No basket orders found. Create a Coach G trade basket first.
        </Text>

        <Pressable
          style={styles.primary}
          onPress={() => router.push("/trade-basket")}
        >
          <Text style={styles.primaryText}>Open Trade Basket</Text>
        </Pressable>

        <Pressable
          style={styles.secondary}
          onPress={() => router.replace("/(tabs)/dashboard")}
        >
          <Text style={styles.secondaryText}>Dashboard</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Orders Review</Text>

        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.replace("/(tabs)/dashboard")}
        >
          <Text style={styles.dashboardButtonText}>Dashboard</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Review, modify, or cancel pending basket orders before queueing them for
        execution.
      </Text>

      <ActiveUserBanner />

      <View style={styles.summaryCard}>
        <Metric label="Pending" value={String(pendingOrders.length)} />
        <Metric label="Queued" value={String(queuedOrders.length)} />
        <Metric label="Filled" value={String(filledOrders.length)} />
        <Metric label="Total" value={String(orders.length)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Status</Text>
        <Text style={styles.body}>
          Basket: {execution.source || "COACH_G"} • Status: {execution.status}
        </Text>
        <Text style={styles.body}>
          Review pending orders, adjust quantity or price, then confirm queue.
        </Text>
      </View>

      <View style={styles.tabs}>
        {["All", "Pending", "Queued", "Filled", "Cancelled"].map((item) => (
          <Pressable
            key={item}
            style={[styles.tab, tab === item && styles.tabActive]}
            onPress={() => setTab(item)}
          >
            <Text style={tab === item ? styles.tabTextActive : styles.tabText}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search symbol, name, or side"
        placeholderTextColor="#64748b"
        style={styles.search}
      />

      {visibleOrders.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.body}>No orders found for this filter.</Text>
        </View>
      ) : (
        visibleOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onChange={(patch) => updateOrder(order, patch)}
            onCancel={() => cancelOrder(order)}
          />
        ))
      )}

      <Pressable
        style={[
          styles.primary,
          pendingOrders.length === 0 && styles.disabledButton
        ]}
        disabled={pendingOrders.length === 0}
        onPress={confirmQueue}
      >
        <Text style={styles.primaryText}>
          {pendingOrders.length > 0
            ? `Confirm Queue (${pendingOrders.length})`
            : "No Pending Orders"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.secondary}
        onPress={() => router.push("/basket-execution")}
      >
        <Text style={styles.secondaryText}>Open Basket Execution</Text>
      </Pressable>
    </ScrollView>
  );
}

function OrderCard({ order, onChange, onCancel }) {
  const locked = ["QUEUED", "FILLED", "CANCELLED", "FAILED"].includes(
    order.status
  );

  const qty = String(order.quantity || "");
  const price = String(order.price || "");
  const amount =
    Number(order.quantity || 0) * Number(order.price || 0);

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderTop}>
        <View>
          <Text style={styles.symbol}>
            {order.side} {order.symbol}
          </Text>

          <Text style={styles.small}>
            {order.name || order.symbol} • {order.sector || "NSE"}
          </Text>
        </View>

        <Text style={statusStyle(order.status)}>{order.status}</Text>
      </View>

      <Text style={styles.reason}>{order.reason}</Text>

      <View style={styles.sideRow}>
        {["BUY", "SELL"].map((side) => (
          <Pressable
            key={side}
            disabled={locked}
            style={[
              styles.sideChip,
              order.side === side && styles.sideChipActive,
              locked && styles.locked
            ]}
            onPress={() => onChange({ side })}
          >
            <Text
              style={
                order.side === side ? styles.sideTextActive : styles.sideText
              }
            >
              {side}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.editGrid}>
        <View style={styles.editBox}>
          <Text style={styles.inputLabel}>Quantity</Text>
          <TextInput
            value={qty}
            editable={!locked}
            keyboardType="numeric"
            placeholder="Qty"
            placeholderTextColor="#64748b"
            style={[styles.input, locked && styles.inputLocked]}
            onChangeText={(value) =>
              onChange({
                quantity: cleanNumber(value),
                gross: cleanNumber(value) * Number(order.price || 0),
                amount: cleanNumber(value) * Number(order.price || 0)
              })
            }
          />
        </View>

        <View style={styles.editBox}>
          <Text style={styles.inputLabel}>Limit Price</Text>
          <TextInput
            value={price}
            editable={!locked}
            keyboardType="numeric"
            placeholder="Price"
            placeholderTextColor="#64748b"
            style={[styles.input, locked && styles.inputLocked]}
            onChangeText={(value) =>
              onChange({
                price: cleanNumber(value),
                gross: Number(order.quantity || 0) * cleanNumber(value),
                amount: Number(order.quantity || 0) * cleanNumber(value)
              })
            }
          />
        </View>
      </View>

      <View style={styles.amountBox}>
        <Text style={styles.amountLabel}>Estimated Value</Text>
        <Text style={styles.amountValue}>KES {money(amount)}</Text>
      </View>

      {order.message ? (
        <Text style={styles.message}>{order.message}</Text>
      ) : null}

      {order.status === "PENDING" ? (
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel Pending Order</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function cleanNumber(value) {
  const number = Number(
    String(value || "")
      .replaceAll(",", "")
      .replace(/[^\d.-]/g, "")
  );

  return Number.isFinite(number) ? number : 0;
}

function statusStyle(status) {
  if (status === "FILLED") return styles.filled;
  if (status === "QUEUED") return styles.queued;
  if (status === "CANCELLED") return styles.cancelled;
  if (status === "FAILED") return styles.failed;
  return styles.pending;
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 110 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  title: { color: "white", fontSize: 32, fontWeight: "900", flex: 1 },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 22 },
  dashboardButton: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14
  },
  dashboardButtonText: { color: "#67e8f9", fontWeight: "900" },
  summaryCard: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metric: {
    width: "47%",
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  metricLabel: { color: "#94a3b8", fontSize: 12 },
  metricValue: {
    color: "white",
    fontWeight: "900",
    fontSize: 18,
    marginTop: 6
  },
  card: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  cardTitle: {
    color: "#67e8f9",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12
  },
  body: { color: "#cbd5e1", marginTop: 8, lineHeight: 21 },
  tabs: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tab: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 999
  },
  tabActive: {
    backgroundColor: "rgba(147,51,234,.25)",
    borderColor: "#9333ea"
  },
  tabText: {
    color: "#cbd5e1",
    fontWeight: "800",
    fontSize: 12
  },
  tabTextActive: {
    color: "white",
    fontWeight: "900",
    fontSize: 12
  },
  search: {
    marginTop: 16,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    color: "white",
    padding: 16,
    borderRadius: 16
  },
  orderCard: {
    marginTop: 18,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  symbol: {
    color: "white",
    fontWeight: "900",
    fontSize: 18
  },
  small: {
    color: "#94a3b8",
    marginTop: 5
  },
  reason: {
    color: "#cbd5e1",
    marginTop: 12,
    lineHeight: 20
  },
  sideRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  sideChip: {
    flex: 1,
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 14,
    padding: 13
  },
  sideChipActive: {
    backgroundColor: "#9333ea",
    borderColor: "#c084fc"
  },
  sideText: {
    color: "#94a3b8",
    textAlign: "center",
    fontWeight: "900"
  },
  sideTextActive: {
    color: "white",
    textAlign: "center",
    fontWeight: "900"
  },
  editGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  editBox: {
    flex: 1
  },
  inputLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 6
  },
  input: {
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    color: "white"
  },
  inputLocked: {
    opacity: 0.55
  },
  locked: {
    opacity: 0.55
  },
  amountBox: {
    marginTop: 16,
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  amountLabel: {
    color: "#94a3b8",
    fontSize: 12
  },
  amountValue: {
    color: "white",
    fontWeight: "900",
    marginTop: 4
  },
  message: {
    color: "#67e8f9",
    marginTop: 10,
    fontSize: 12,
    fontWeight: "800"
  },
  pending: { color: "#fbbf24", fontWeight: "900", fontSize: 12 },
  queued: { color: "#67e8f9", fontWeight: "900", fontSize: 12 },
  filled: { color: "#86efac", fontWeight: "900", fontSize: 12 },
  cancelled: { color: "#94a3b8", fontWeight: "900", fontSize: 12 },
  failed: { color: "#fca5a5", fontWeight: "900", fontSize: 12 },
  primary: {
    marginTop: 22,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18
  },
  primaryText: { color: "white", textAlign: "center", fontWeight: "900" },
  disabledButton: { opacity: 0.45 },
  secondary: {
    marginTop: 14,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 18
  },
  secondaryText: {
    color: "#67e8f9",
    textAlign: "center",
    fontWeight: "900"
  },
  cancelButton: {
    marginTop: 16,
    backgroundColor: "rgba(239,68,68,.12)",
    borderColor: "rgba(239,68,68,.35)",
    borderWidth: 1,
    padding: 14,
    borderRadius: 16
  },
  cancelText: {
    color: "#fca5a5",
    textAlign: "center",
    fontWeight: "900"
  }
});