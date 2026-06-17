import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import ActiveUserBanner from "../../src/components/ActiveUserBanner";
import { loadTradingHubData } from "../../src/trade/tradingHubStore";
import { queueExecutionOrders } from "../../src/trade/basketExecutionStore";
import { userSetItem } from "../../src/auth/userStorage";

export default function Trading() {
  const [data, setData] = useState(null);
  const [side, setSide] = useState("BUY");
  const [symbol, setSymbol] = useState("SCOM");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("0");
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    const result = await loadTradingHubData();
    setData(result);

    const firstOrder = result.orders?.[0];

    if (firstOrder) {
      setSide(firstOrder.side || "BUY");
      setSymbol(firstOrder.symbol || "SCOM");
      setQuantity(String(firstOrder.quantity || 1));
      setPrice(String(firstOrder.price || 0));
    }
  }

  const broker = data?.broker;
  const orders = data?.orders || [];
  const portfolio = data?.portfolio || [];
  const cash = Number(data?.cash || 0);

  const estimate = useMemo(() => {
    const qty = Number(quantity || 0);
    const px = Number(price || 0);
    return qty * px;
  }, [quantity, price]);

  async function prepareBasket() {
    if (!broker) {
      Alert.alert("Broker Required", "Connect a broker before preparing orders.");
      router.push("/broker-accounts");
      return;
    }

    if (!orders.length) {
      Alert.alert("No Basket Orders", "No Coach G basket orders found.");
      return;
    }

    await queueExecutionOrders();

    await userSetItem(
      "latestOrderHandoff",
      JSON.stringify({
        broker,
        orders,
        totalOrders: orders.length,
        totalValue: orders.reduce(
          (sum, order) =>
            sum + Number(order.quantity || 0) * Number(order.price || 0),
          0
        ),
        status: "HANDOFF_READY",
        savedAt: new Date().toISOString()
      })
    );

    Alert.alert(
      "Order Pack Ready",
      "Broker-ready orders have been prepared. Use your broker portal to complete execution."
    );
  }

  async function saveDepositRequest() {
    await userSetItem(
      "latestBrokerDepositRequest",
      JSON.stringify({
        broker,
        amount: Number(depositAmount || 0),
        mpesaNumber,
        status: "DEPOSIT_REQUEST_PREPARED",
        createdAt: new Date().toISOString()
      })
    );

    setShowDeposit(false);

    Alert.alert(
      "Deposit Request Saved",
      "Deposit request saved for broker follow-up."
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Trading</Text>

        <Pressable
          style={styles.dashboardButton}
          onPress={() => router.replace("/(tabs)/dashboard")}
        >
          <Text style={styles.dashboardButtonText}>Dashboard</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Broker workspace for basket orders, cash, deposits, and order status.
      </Text>

      <ActiveUserBanner />

      {!broker && (
  <View style={styles.warningCard}>
    <Text style={styles.warningTitle}>
      Broker Required
    </Text>

    <Text style={styles.body}>
      Connect a broker account before submitting orders.
    </Text>

    <Pressable
      style={styles.primary}
      onPress={() => router.push("/broker-accounts")}
    >
      <Text style={styles.primaryText}>
        Connect Broker
      </Text>
    </Pressable>
  </View>
)}

      <View style={styles.brokerCard}>
        <Text style={styles.label}>Trading Account</Text>

        <Text style={styles.brokerName}>
          {broker?.broker || broker?.name || "No Broker Connected"}
        </Text>

        <Text style={styles.body}>
          Client: {broker?.clientNumber || broker?.accountNumber || "Not Linked"}
        </Text>

        <Pressable
          style={styles.secondary}
          onPress={() => router.push("/broker-accounts")}
        >
          <Text style={styles.secondaryText}>
            {broker ? "Manage Broker" : "Connect Broker"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.cashCard}>
        <Metric label="Available Cash" value={`KES ${money(cash)}`} />
        <Metric label="Portfolio Positions" value={String(portfolio.length)} />
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.actionButton} onPress={() => setShowDeposit(true)}>
          <Text style={styles.actionText}>Deposit</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => Alert.alert("Withdraw", "Withdrawal workflow will connect to broker instructions.")}
        >
          <Text style={styles.actionText}>Withdraw</Text>
        </Pressable>

        <Pressable
          style={styles.actionButton}
          onPress={() => Alert.alert("Statement", "Broker statement request saved for future connector.")}
        >
          <Text style={styles.actionText}>Statement</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Basket Orders</Text>

        {orders.length === 0 ? (
          <Text style={styles.body}>
            No active Coach G basket orders. Create a basket from Coach G first.
          </Text>
        ) : (
          orders.map((order) => (
            <Pressable
              key={order.id}
              style={styles.orderRow}
              onPress={() => {
                setSide(order.side || "BUY");
                setSymbol(order.symbol || "");
                setQuantity(String(order.quantity || 1));
                setPrice(String(order.price || 0));
              }}
            >
              <View>
                <Text style={styles.orderSymbol}>
                  {order.side} {order.symbol}
                </Text>
                <Text style={styles.small}>
                  Qty {order.quantity} @ KES {money(order.price)}
                </Text>
              </View>

              <Text style={styles.status}>{order.status}</Text>
            </Pressable>
          ))
        )}

        <Pressable
          style={[styles.primary, !orders.length && styles.disabledButton]}
          disabled={!orders.length}
          onPress={prepareBasket}
        >
          <Text style={styles.primaryText}>
            Prepare Broker Order Pack
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Ticket</Text>

        <View style={styles.sideRow}>
          {["BUY", "SELL"].map((item) => (
            <Pressable
              key={item}
              style={[styles.sideChip, side === item && styles.sideActive]}
              onPress={() => setSide(item)}
            >
              <Text style={side === item ? styles.sideTextActive : styles.sideText}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.inputLabel}>Symbol</Text>
        <TextInput
          value={symbol}
          onChangeText={(value) => setSymbol(value.toUpperCase())}
          placeholder="SCOM"
          placeholderTextColor="#64748b"
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Quantity</Text>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="Quantity"
          placeholderTextColor="#64748b"
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Limit Price</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="Price"
          placeholderTextColor="#64748b"
          style={styles.input}
        />

        <View style={styles.estimateBox}>
          <Text style={styles.label}>Estimated Value</Text>
          <Text style={styles.estimate}>KES {money(estimate)}</Text>
        </View>

        <Pressable
          style={styles.primary}
          onPress={() =>
            Alert.alert(
              "Order Drafted",
              `${side} ${quantity} ${symbol} @ KES ${price} prepared.`
            )
          }
        >
          <Text style={styles.primaryText}>Draft Order</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Book</Text>
        <Text style={styles.body}>
          Broker order book will appear here once broker connectivity is enabled.
        </Text>

        <View style={styles.card}>
  <Text style={styles.cardTitle}>Holdings</Text>

  {portfolio.slice(0, 10).map((holding) => (
    <View
      key={holding.symbol}
      style={styles.orderRow}
    >
      <View>
        <Text style={styles.orderSymbol}>
          {holding.symbol}
        </Text>

        <Text style={styles.small}>
          Qty {holding.quantity}
        </Text>
      </View>

      <Text style={styles.status}>
        KES {money(holding.marketValue)}
      </Text>
    </View>
  ))}
</View> 

        <View style={styles.bookRow}>
          <Text style={styles.bookText}>BID</Text>
          <Text style={styles.bookText}>Price</Text>
          <Text style={styles.bookText}>Volume</Text>
        </View>

        <View style={styles.bookRow}>
          <Text style={styles.green}>BUY</Text>
          <Text style={styles.body}>--</Text>
          <Text style={styles.body}>--</Text>
        </View>

        <View style={styles.bookRow}>
          <Text style={styles.red}>SELL</Text>
          <Text style={styles.body}>--</Text>
          <Text style={styles.body}>--</Text>
        </View>
      </View>

      <DepositModal
        visible={showDeposit}
        broker={broker}
        amount={depositAmount}
        setAmount={setDepositAmount}
        mpesaNumber={mpesaNumber}
        setMpesaNumber={setMpesaNumber}
        onClose={() => setShowDeposit(false)}
        onSave={saveDepositRequest}
      />
    </ScrollView>
  );
}

function DepositModal({
  visible,
  broker,
  amount,
  setAmount,
  mpesaNumber,
  setMpesaNumber,
  onClose,
  onSave
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Deposit Trading Funds</Text>

          <Text style={styles.body}>
            Broker: {broker?.broker || broker?.name || "No Broker"}
          </Text>

          <Text style={styles.inputLabel}>Amount</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="250000"
            placeholderTextColor="#64748b"
            style={styles.input}
          />

          <Text style={styles.inputLabel}>M-Pesa Number</Text>
          <TextInput
            value={mpesaNumber}
            onChangeText={setMpesaNumber}
            keyboardType="phone-pad"
            placeholder="2547..."
            placeholderTextColor="#64748b"
            style={styles.input}
          />

          <Pressable style={styles.primary} onPress={onSave}>
            <Text style={styles.primaryText}>Save Deposit Request</Text>
          </Pressable>

          <Pressable style={styles.secondary} onPress={onClose}>
            <Text style={styles.secondaryText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 120 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  title: { color: "white", fontSize: 34, fontWeight: "900", flex: 1 },
  subtitle: { color: "#94a3b8", marginTop: 8, lineHeight: 22 },
  dashboardButton: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14
  },
  dashboardButtonText: { color: "#67e8f9", fontWeight: "900" },
  brokerCard: {
    marginTop: 18,
    backgroundColor: "rgba(6,182,212,.10)",
    borderColor: "rgba(6,182,212,.35)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  brokerName: { color: "white", fontSize: 24, fontWeight: "900", marginTop: 6 },
  label: { color: "#94a3b8", fontSize: 12 },
  body: { color: "#cbd5e1", marginTop: 8, lineHeight: 21 },
  cashCard: {
    marginTop: 18,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    gap: 12
  },
  metric: {
    flex: 1,
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  metricValue: {
    color: "white",
    fontWeight: "900",
    marginTop: 6
  },
  actionRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    padding: 14,
    borderRadius: 16
  },
  actionText: { color: "#67e8f9", textAlign: "center", fontWeight: "900" },
  card: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  cardTitle: { color: "#67e8f9", fontSize: 18, fontWeight: "900" },
  orderRow: {
    marginTop: 12,
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  orderSymbol: { color: "white", fontWeight: "900", fontSize: 16 },
  small: { color: "#94a3b8", marginTop: 4, fontSize: 12 },
  status: { color: "#fbbf24", fontWeight: "900", fontSize: 12 },
  sideRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10
  },
  sideChip: {
    flex: 1,
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14
  },
  sideActive: {
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
  inputLabel: {
    color: "#94a3b8",
    marginTop: 14,
    marginBottom: 6,
    fontSize: 12
  },
  input: {
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    color: "white"
  },
  estimateBox: {
    marginTop: 16,
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  estimate: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 5
  },
  bookRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingBottom: 10
  },
  bookText: { color: "#94a3b8", fontWeight: "900" },
  green: { color: "#86efac", fontWeight: "900" },
  red: { color: "#fca5a5", fontWeight: "900" },
  primary: {
    marginTop: 18,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18
  },
  primaryText: { color: "white", textAlign: "center", fontWeight: "900" },
  disabledButton: { opacity: 0.45 },
  secondary: {
    marginTop: 12,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16
  },
  secondaryText: { color: "#67e8f9", textAlign: "center", fontWeight: "900" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.72)",
    justifyContent: "center",
    padding: 18
  },
  modal: {
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 24,
    padding: 20
  },

warningCard: {
  marginTop: 16,
  backgroundColor: "rgba(251,191,36,.10)",
  borderColor: "rgba(251,191,36,.35)",
  borderWidth: 1,
  borderRadius: 20,
  padding: 16
},

warningTitle: {
  color: "#fbbf24",
  fontWeight: "900",
  fontSize: 18
},

  modalTitle: { color: "white", fontSize: 26, fontWeight: "900" }
});