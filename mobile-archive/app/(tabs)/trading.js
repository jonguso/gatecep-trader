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
import { userGetItem, userSetItem } from "../../src/auth/userStorage";
import { getMarketDepth } from "../../src/trade/marketDepthData";

const TRADING_TABS = ["Account", "Orders", "Depth", "Activity"];

const EXECUTION_FLOW = [
  "READY_FOR_BROKER",
  "SUBMITTED",
  "BROKER_ACCEPTED",
  "FILLED"
];

export default function Trading() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("Account");
  const [side, setSide] = useState("BUY");
  const [symbol, setSymbol] = useState("SCOM");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("0");
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [executionStatus, setExecutionStatus] = useState(null);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    const result = await loadTradingHubData();
    setData(result);

    const savedExecution = await userGetItem("latestOrderHandoff");
    if (savedExecution) {
      setExecutionStatus(JSON.parse(savedExecution));
    }

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
  const cash = Number(data?.cash || 0);

  const estimate = useMemo(() => {
    return Number(quantity || 0) * Number(price || 0);
  }, [quantity, price]);

  const depth = useMemo(() => {
    return getMarketDepth(symbol);
  }, [symbol]);

  const liveOpenOrders =
    executionStatus && executionStatus.status !== "FILLED"
      ? executionStatus.orders || []
      : [];

  const recentExecutions =
    executionStatus?.status === "FILLED"
      ? executionStatus.orders || []
      : [];

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

    const handoff = {
      broker,
      orders,
      totalOrders: orders.length,
      totalValue: orders.reduce(
        (sum, order) =>
          sum + Number(order.quantity || 0) * Number(order.price || 0),
        0
      ),
      status: "READY_FOR_BROKER",
      submitted: false,
      createdAt: new Date().toISOString()
    };

    await userSetItem("latestOrderHandoff", JSON.stringify(handoff));
    setExecutionStatus(handoff);

    Alert.alert("Order Pack Ready", "Orders moved to execution status.");
  }

  async function submitToBroker() {
    if (!executionStatus) return;

    const updated = {
      ...executionStatus,
      status: "SUBMITTED",
      submitted: true,
      submittedAt: new Date().toISOString()
    };

    await userSetItem("latestOrderHandoff", JSON.stringify(updated));
    setExecutionStatus(updated);
  }

  async function acceptByBroker() {
    if (!executionStatus) return;

    const updated = {
      ...executionStatus,
      status: "BROKER_ACCEPTED",
      brokerAcceptedAt: new Date().toISOString()
    };

    await userSetItem("latestOrderHandoff", JSON.stringify(updated));
    setExecutionStatus(updated);
  }

  async function markFilled() {
    if (!executionStatus) return;

    const updated = {
      ...executionStatus,
      status: "FILLED",
      filledAt: new Date().toISOString()
    };

    await userSetItem("latestOrderHandoff", JSON.stringify(updated));
    setExecutionStatus(updated);
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
    setDepositAmount("");
    setMpesaNumber("");

    Alert.alert("Deposit Request Saved", "Deposit request saved for broker follow-up.");
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
        Broker workspace for account, orders, market depth, and execution activity.
      </Text>

      <ActiveUserBanner />

      <View style={styles.tabRow}>
        {TRADING_TABS.map((item) => (
          <Pressable
            key={item}
            style={[styles.tabButton, tab === item && styles.activeTab]}
            onPress={() => setTab(item)}
          >
            <Text style={tab === item ? styles.activeTabText : styles.tabText}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "Account" ? (
        <>
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

          {!broker ? (
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>Broker Required</Text>

              <Text style={styles.body}>
                Connect a broker before preparing or submitting orders.
              </Text>

              <Pressable
                style={styles.primary}
                onPress={() => router.push("/broker-accounts")}
              >
                <Text style={styles.primaryText}>Connect Broker</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.cashCard}>
            <Metric label="Available Cash" value={`KES ${money(cash)}`} />
            <Metric label="Broker Mode" value={broker ? "Linked" : "Missing"} />
          </View>

          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton} onPress={() => setShowDeposit(true)}>
              <Text style={styles.actionText}>Deposit</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() =>
                Alert.alert(
                  "Withdraw",
                  "Withdrawal workflow will connect to broker instructions."
                )
              }
            >
              <Text style={styles.actionText}>Withdraw</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() =>
                Alert.alert(
                  "Statement",
                  "Broker statement request saved for future connector."
                )
              }
            >
              <Text style={styles.actionText}>Statement</Text>
            </Pressable>
          </View>
        </>
      ) : null}

      {tab === "Orders" ? (
        <>
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
              style={[styles.primary, (!orders.length || !broker) && styles.disabledButton]}
              disabled={!orders.length || !broker}
              onPress={prepareBasket}
            >
              <Text style={styles.primaryText}>
                {!broker ? "Connect Broker First" : "Prepare Broker Order Pack"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Execution Status</Text>

            {!executionStatus ? (
              <Text style={styles.body}>No orders prepared yet.</Text>
            ) : (
              <>
                <Text style={styles.body}>
                  Current status: {executionStatus.status}
                </Text>

                <View style={styles.timelineCard}>
                  {EXECUTION_FLOW.map((step, index) => {
                    const currentIndex = EXECUTION_FLOW.indexOf(
                      executionStatus.status
                    );

                    const completed = index < currentIndex;
                    const active = index === currentIndex;

                    return (
                      <View key={step} style={styles.timelineRow}>
                        <Text style={styles.orderSymbol}>{step}</Text>

                        <Text
                          style={
                            active
                              ? styles.green
                              : completed
                              ? styles.completed
                              : styles.timelinePending
                          }
                        >
                          {active ? "ACTIVE" : completed ? "DONE" : "PENDING"}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.orderRow}>
                  <Text style={styles.orderSymbol}>Orders</Text>
                  <Text style={styles.status}>{executionStatus.totalOrders}</Text>
                </View>

                <View style={styles.orderRow}>
                  <Text style={styles.orderSymbol}>Value</Text>
                  <Text style={styles.status}>
                    KES {money(executionStatus.totalValue)}
                  </Text>
                </View>

                {executionStatus.status === "READY_FOR_BROKER" ? (
                  <Pressable style={styles.primary} onPress={submitToBroker}>
                    <Text style={styles.primaryText}>Submit To Broker</Text>
                  </Pressable>
                ) : null}

                {executionStatus.status === "SUBMITTED" ? (
                  <Pressable style={styles.secondary} onPress={acceptByBroker}>
                    <Text style={styles.secondaryText}>
                      Simulate Broker Acceptance
                    </Text>
                  </Pressable>
                ) : null}

                {executionStatus.status === "BROKER_ACCEPTED" ? (
                  <Pressable style={styles.primary} onPress={markFilled}>
                    <Text style={styles.primaryText}>Mark Filled</Text>
                  </Pressable>
                ) : null}
              </>
            )}
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
              style={[styles.primary, !broker && styles.disabledButton]}
              disabled={!broker}
              onPress={() =>
                Alert.alert(
                  "Order Drafted",
                  `${side} ${quantity} ${symbol} @ KES ${price} prepared.`
                )
              }
            >
              <Text style={styles.primaryText}>
                {broker ? "Draft Order" : "Connect Broker First"}
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}

      {tab === "Depth" ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Market Depth</Text>

          <Text style={styles.body}>{depth.symbol} live depth preview.</Text>

          <View style={styles.depthSummary}>
            <Metric label="Best Bid" value={`KES ${money(depth.bestBid)}`} />
            <Metric label="Best Ask" value={`KES ${money(depth.bestAsk)}`} />
            <Metric label="Spread" value={`KES ${money(depth.spread)}`} />
          </View>

          <View style={styles.bookHeader}>
            <Text style={[styles.bookHeaderText, { textAlign: "left" }]}>
              Bid Qty
            </Text>

            <Text style={[styles.bookHeaderText, { textAlign: "center" }]}>
              Price
            </Text>

            <Text style={[styles.bookHeaderText, { textAlign: "right" }]}>
              Ask Qty
            </Text>
          </View>

          {depth.bids.map((bid, index) => {
            const ask = depth.asks[index];

            return (
              <View key={`${bid.price}-${index}`} style={styles.bookRow}>
                <View style={styles.depthSide}>
                  <View
                    style={[
                      styles.bidDepthBar,
                      {
                        width: `${Math.min((bid.qty / 120000) * 100, 100)}%`
                      }
                    ]}
                  />

                  <Text style={styles.bidText}>{bid.qty.toLocaleString()}</Text>
                </View>

                <Text style={styles.bookValue}>KES {money(bid.price)}</Text>

                <View style={styles.depthSide}>
                  <View
                    style={[
                      styles.askDepthBar,
                      {
                        width: `${Math.min(((ask?.qty || 0) / 120000) * 100, 100)}%`
                      }
                    ]}
                  />

                  <Text style={styles.askText}>
                    {ask?.qty?.toLocaleString() || "--"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {tab === "Activity" ? (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Open Orders</Text>

            {liveOpenOrders.length === 0 ? (
              <Text style={styles.body}>No open orders.</Text>
            ) : (
              liveOpenOrders.map((order) => (
                <View key={order.id} style={styles.orderRow}>
                  <View>
                    <Text style={styles.orderSymbol}>
                      {order.side} {order.symbol}
                    </Text>

                    <Text style={styles.small}>
                      Qty {order.quantity} @ KES {money(order.price)}
                    </Text>
                  </View>

                  <Text style={styles.status}>{executionStatus.status}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Recent Executions</Text>

            {recentExecutions.length === 0 ? (
              <Text style={styles.body}>No executions yet.</Text>
            ) : (
              recentExecutions.map((order) => (
                <View key={order.id} style={styles.orderRow}>
                  <View>
                    <Text style={styles.orderSymbol}>FILLED {order.symbol}</Text>

                    <Text style={styles.small}>
                      Qty {order.quantity} @ KES {money(order.price)}
                    </Text>
                  </View>

                  <Text style={styles.green}>FILLED</Text>
                </View>
              ))
            )}
          </View>
        </>
      ) : null}

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
  tabRow: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#1e293b"
  },
  activeTab: { backgroundColor: "#9333ea" },
  tabText: { color: "#94a3b8", fontWeight: "900" },
  activeTabText: { color: "white", fontWeight: "900" },
  brokerCard: {
    marginTop: 18,
    backgroundColor: "rgba(6,182,212,.10)",
    borderColor: "rgba(6,182,212,.35)",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  brokerName: { color: "white", fontSize: 24, fontWeight: "900", marginTop: 6 },
  warningCard: {
    marginTop: 16,
    backgroundColor: "rgba(251,191,36,.10)",
    borderColor: "rgba(251,191,36,.35)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16
  },
  warningTitle: { color: "#fbbf24", fontWeight: "900", fontSize: 18 },
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
  metricValue: { color: "white", fontWeight: "900", marginTop: 6 },
  actionRow: { marginTop: 14, flexDirection: "row", gap: 10 },
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
  timelineCard: {
    marginTop: 14,
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 12
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1
  },
  timelinePending: { color: "#64748b", fontWeight: "900" },
  completed: { color: "#67e8f9", fontWeight: "900" },
  sideRow: { marginTop: 16, flexDirection: "row", gap: 10 },
  sideChip: {
    flex: 1,
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14
  },
  sideActive: { backgroundColor: "#9333ea", borderColor: "#c084fc" },
  sideText: { color: "#94a3b8", textAlign: "center", fontWeight: "900" },
  sideTextActive: { color: "white", textAlign: "center", fontWeight: "900" },
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
  estimate: { color: "white", fontSize: 20, fontWeight: "900", marginTop: 5 },
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
  modalTitle: { color: "white", fontSize: 26, fontWeight: "900" },
  depthSummary: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10
  },
  bookHeader: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#334155",
    borderBottomWidth: 1,
    paddingBottom: 10
  },
  bookHeaderText: {
    flex: 1,
    color: "#94a3b8",
    fontWeight: "900"
  },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    minHeight: 44,
    paddingVertical: 4
  },
  depthSide: {
    flex: 1,
    height: 32,
    justifyContent: "center",
    position: "relative"
  },
  bidDepthBar: {
    position: "absolute",
    left: 0,
    top: 6,
    bottom: 6,
    backgroundColor: "rgba(34,197,94,.18)",
    borderRadius: 4
  },
  askDepthBar: {
    position: "absolute",
    right: 0,
    top: 6,
    bottom: 6,
    backgroundColor: "rgba(239,68,68,.18)",
    borderRadius: 4
  },
  bidText: {
    flex: 1,
    color: "#86efac",
    fontWeight: "900"
  },
  askText: {
    flex: 1,
    color: "#fca5a5",
    fontWeight: "900",
    textAlign: "right"
  },
  bookValue: {
    flex: 1,
    color: "white",
    fontWeight: "900",
    textAlign: "center"
  }
});