import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import ActiveUserBanner from "../src/components/ActiveUserBanner";
import { loadPortfolio, savePortfolio } from "../src/portfolio/portfolioStore";
import { userGetItem, userSetItem } from "../src/auth/userStorage";
import {
  clearBasketExecution,
  createBasketExecution,
  loadBasketExecution,
  saveBasketExecution
} from "../src/trade/basketExecutionStore";
import { buildSyncStatus } from "../src/portfolio/syncStatus";

export default function BasketExecution() {
  const [execution, setExecution] = useState(null);

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

  const preparedOrders = useMemo(() => {
    return orders.map((order) => {
      const price = Number(order.price || order.limitPrice || 0);
      const amount = Number(order.amount || 0);
      const quantity =
        Number(order.quantity || 0) > 0
          ? Number(order.quantity)
          : price > 0 && amount > 0
          ? Math.floor(amount / price)
          : 0;

      const gross = quantity * price;

      return {
        ...order,
        price,
        quantity,
        gross,
        amount: amount || gross
      };
    });
  }, [orders]);

  const totalAmount = preparedOrders.reduce(
    (sum, item) => sum + Number(item.amount || item.gross || 0),
    0
  );

  const completed = preparedOrders.filter((x) => x.status === "FILLED").length;

  async function executeBasket() {
    if (!preparedOrders.length) {
      Alert.alert("No Basket", "Create a trade basket first.");
      return;
    }

    const cashRaw = await userGetItem("availableCash");
    let cash = Number(cashRaw || 0);

    const portfolio = await loadPortfolio({ revalue: false });
    let nextPortfolio = [...portfolio];

    const tradesRaw = await userGetItem("simulatedTrades");
    const trades = tradesRaw ? JSON.parse(tradesRaw) : [];

    const executable = preparedOrders.filter((order) => order.status !== "FILLED");

    const totalRequired = executable.reduce((sum, order) => {
      const gross = Number(order.gross || 0);
      const fees = gross * 0.014;
      return order.side === "SELL" ? sum : sum + gross + fees;
    }, 0);

    if (cash < totalRequired) {
      Alert.alert(
        "Insufficient Cash",
        `Basket needs KES ${money(totalRequired)} but available cash is KES ${money(cash)}.`
      );
      return;
    }

    const filledOrders = executable.map((order) => {
      const gross = Number(order.gross || 0);
      const brokerFee = gross * 0.012;
      const regulatoryFee = gross * 0.002;
      const totalFees = brokerFee + regulatoryFee;
      const totalCost =
        order.side === "SELL" ? Math.max(gross - totalFees, 0) : gross + totalFees;

      if (order.side === "BUY") {
        const existingIndex = nextPortfolio.findIndex(
          (item) => String(item.symbol).toUpperCase() === String(order.symbol).toUpperCase()
        );

        if (existingIndex >= 0) {
          const existing = nextPortfolio[existingIndex];
          const existingQty = Number(existing.quantity || 0);
          const existingAvg = Number(existing.averagePrice || existing.averageCost || 0);
          const existingCost = existingQty * existingAvg;

          const newQty = existingQty + Number(order.quantity || 0);
          const newCost = existingCost + totalCost;
          const newAvg = newQty > 0 ? newCost / newQty : Number(order.price || 0);
          const newMarketValue = newQty * Number(order.price || 0);

          nextPortfolio[existingIndex] = {
            ...existing,
            quantity: newQty,
            averagePrice: newAvg,
            averageCost: newAvg,
            costValue: newCost,
            investedValue: newCost,
            marketPrice: Number(order.price || 0),
            price: Number(order.price || 0),
            marketValue: newMarketValue,
            value: newMarketValue,
            profitLoss: newMarketValue - newCost,
            profitLossPct: newCost > 0 ? ((newMarketValue - newCost) / newCost) * 100 : 0,
            source: "BASKET_EXECUTION",
            updatedAt: new Date().toISOString()
          };
        } else {
          const avg = Number(order.quantity || 0) > 0 ? totalCost / Number(order.quantity || 0) : Number(order.price || 0);

          nextPortfolio.push({
            symbol: order.symbol,
            name: order.name || order.symbol,
            sector: order.sector || "NSE",
            quantity: Number(order.quantity || 0),
            averagePrice: avg,
            averageCost: avg,
            costValue: totalCost,
            investedValue: totalCost,
            marketPrice: Number(order.price || 0),
            price: Number(order.price || 0),
            marketValue: gross,
            value: gross,
            profitLoss: gross - totalCost,
            profitLossPct: totalCost > 0 ? ((gross - totalCost) / totalCost) * 100 : 0,
            source: "BASKET_EXECUTION",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }

        cash -= totalCost;
      }

      const trade = {
        id: `BASKET-TRD-${Date.now()}-${order.symbol}`,
        symbol: order.symbol,
        name: order.name || order.symbol,
        sector: order.sector || "NSE",
        side: order.side || "BUY",
        quantity: Number(order.quantity || 0),
        price: Number(order.price || 0),
        gross,
        brokerFee,
        regulatoryFee,
        totalFees,
        totalCost,
        cashAfter: cash,
        tradedAt: new Date().toISOString(),
        status: "SIMULATED_EXECUTED",
        settlementStatus: "SETTLED",
        source: "BASKET_EXECUTION"
      };

      trades.unshift(trade);

      return {
        ...order,
        status: "FILLED",
        message: "Executed through basket buy all",
        trade,
        filledAt: new Date().toISOString()
      };
    });

    const updatedOrders = preparedOrders.map((order) => {
      const filled = filledOrders.find((x) => x.id === order.id);
      return filled || order;
    });

    const updatedExecution = {
      ...execution,
      status: "COMPLETED",
      completedOrders: updatedOrders.filter((x) => x.status === "FILLED").length,
      totalOrders: updatedOrders.length,
      totalAmount,
      orders: updatedOrders,
      completedAt: new Date().toISOString()
    };

    await savePortfolio(nextPortfolio);
    await userSetItem("availableCash", String(cash));
    await userSetItem("statementUploaded", "true");
    await userSetItem("simulatedTrades", JSON.stringify(trades));
    await saveBasketExecution(updatedExecution);
    await buildSyncStatus();

    setExecution(updatedExecution);

    Alert.alert("Basket Complete", "All basket orders were executed.");
  }

  async function queueForTradeScreen() {
    const queued = {
      ...execution,
      status: "IN_PROGRESS",
      orders: preparedOrders.map((order) => ({
        ...order,
        status: order.status === "FILLED" ? "FILLED" : "QUEUED",
        message:
          order.status === "FILLED"
            ? "Already filled"
            : "Queued for trade screen"
      }))
    };

    const saved = await saveBasketExecution(queued);
    setExecution(saved);

    router.push("/trade");
  }

  async function clearExecution() {
    await clearBasketExecution();
    setExecution(null);
  }

  if (!execution || !orders.length) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Basket Execution</Text>
        <Text style={styles.subtitle}>No active basket execution found.</Text>

        <Pressable style={styles.primary} onPress={() => router.push("/trade-basket")}>
          <Text style={styles.primaryText}>Open Trade Basket</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Basket Execution</Text>

        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.replace("/(tabs)/dashboard")}
        >
          <Text style={styles.dashboardButtonText}>Dashboard</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Execute Coach G basket orders and track progress.
      </Text>

      <ActiveUserBanner />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Execution Progress</Text>
        <Text style={styles.summaryValue}>
          {completed}/{preparedOrders.length}
        </Text>
        <Text style={styles.body}>
          Status: {execution.status} • Total KES {money(totalAmount)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Orders</Text>

        {preparedOrders.map((order) => (
          <View key={order.id} style={styles.orderRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>
                {String(order.symbol || "?").slice(0, 2)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.symbol}>{order.symbol}</Text>
              <Text style={styles.bodySmall}>
                {order.side || "BUY"} • Qty {order.quantity} • KES {money(order.amount)}
              </Text>
              <Text style={styles.reason}>
                Price KES {money(order.price)} • {order.message || "Ready"}
              </Text>
            </View>

            <Text style={statusStyle(order.status)}>{order.status || "READY"}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.primary} onPress={executeBasket}>
        <Text style={styles.primaryText}>Buy All Basket Orders</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={queueForTradeScreen}>
        <Text style={styles.secondaryText}>Review One by One in Trade Screen</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={() => router.push("/trade")}>
        <Text style={styles.secondaryText}>Open Trade Screen</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={clearExecution}>
        <Text style={styles.secondaryText}>Clear Execution</Text>
      </Pressable>
    </ScrollView>
  );
}

function statusStyle(status) {
  if (status === "FILLED") return styles.filled;
  if (status === "FAILED") return styles.failed;
  if (status === "QUEUED" || status === "SUBMITTED") return styles.queued;
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
    backgroundColor: "rgba(147,51,234,.14)",
    borderColor: "rgba(147,51,234,.38)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  summaryLabel: { color: "#cbd5e1" },
  summaryValue: {
    color: "white",
    fontSize: 38,
    fontWeight: "900",
    marginTop: 6
  },
  body: { color: "#cbd5e1", marginTop: 8, lineHeight: 21 },
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
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 14
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  logoText: { color: "#67e8f9", fontWeight: "900", fontSize: 13 },
  symbol: { color: "white", fontWeight: "900", fontSize: 16 },
  bodySmall: { color: "#cbd5e1", marginTop: 4, fontSize: 12 },
  reason: { color: "#94a3b8", marginTop: 4, fontSize: 12 },
  pending: { color: "#94a3b8", fontWeight: "900", fontSize: 12 },
  queued: { color: "#67e8f9", fontWeight: "900", fontSize: 12 },
  filled: { color: "#86efac", fontWeight: "900", fontSize: 12 },
  failed: { color: "#fca5a5", fontWeight: "900", fontSize: 12 },
  primary: {
    marginTop: 20,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18
  },
  primaryText: { color: "white", textAlign: "center", fontWeight: "900" },
  secondary: {
    marginTop: 14,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 18
  },
  secondaryText: { color: "#67e8f9", textAlign: "center", fontWeight: "900" }
});