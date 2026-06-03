import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable
} from "react-native";

import { router } from "expo-router";

import { API_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { connectSocket } from "../services/socket/socketClient";
import { sendLocalNotification } from "../services/notifications/notificationService";
import { registerForPushNotifications } from "../services/notifications/notificationService";

export default function MobileDashboardScreen() {
  const { user, token, logout } = useAuth();

  const [portfolio, setPortfolio] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [signals, setSignals] = useState([]);
  const [notifications, setNotifications] = useState([]);

  async function loadDashboard() {
    try {
      const [portfolioRes, watchlistRes, signalsRes, notificationsRes] =
        await Promise.all([
          fetch(`${API_URL}/portfolio-live`),
          fetch(`${API_URL}/watchlist`),
          fetch(`${API_URL}/ai/signals`),
          fetch(`${API_URL}/notifications`)
        ]);

      const portfolioData = await portfolioRes.json();
      const watchlistData = await watchlistRes.json();
      const signalsData = await signalsRes.json();
      const notificationsData = await notificationsRes.json();

      if (portfolioData.ok) {
        setPortfolio(portfolioData.portfolio);
      }

      if (watchlistData.ok) {
        setWatchlist(watchlistData.watchlist || []);
      }

      if (signalsData.ok) {
        setSignals(signalsData.signals || []);
      }

      if (notificationsData.ok) {
        setNotifications(notificationsData.notifications || []);
      }
    } catch (error) {
      console.log("Dashboard load failed", error.message);
    }
  }

  useEffect(() => {
  if (!token) return;   
 
    loadDashboard();

    const interval = setInterval(loadDashboard, 5000);

    const socket = connectSocket(token);
	
	registerForPushNotifications();

    socket.on("market:tick", (ticks) => {
      setWatchlist((current) =>
        current.map((item) => {
          const tick = ticks.find((t) => t.symbol === item.symbol);

          if (!tick) return item;

          return {
            ...item,
            price: tick.price,
            change: tick.change,
            changePct: tick.changePct
          };
        })
      );
    });
	socket.on("order:update", async (order) => {
  await sendLocalNotification(
    `Order ${order.status}`,
    `${order.symbol} ${order.side} ${order.quantity} via ${order.broker}`
  );
});

	socket.on("notification:new", async (notification) => {
  await sendLocalNotification(
    notification.type || "Gatecep Alert",
    notification.message
  );
});

   socket.on("notification:new", async (notification) => {
  await sendLocalNotification(
    notification.type || "Gatecep Alert",
    notification.message
  );
});
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
               <View>
          <Text style={styles.title}>Gatecep Mobile</Text>

          <Text style={styles.subtitle}>
            {user?.username} • {user?.role}
          </Text>

          <Pressable
            style={styles.tradeButton}
            onPress={() => router.push("/trading")}
          >
            <Text style={styles.buttonText}>
              Open Trading Ticket
            </Text>
          </Pressable>

          <Pressable
            style={styles.coachButton}
            onPress={() => router.push("/coachg")}
          >
            <Text style={styles.buttonText}>
              Coach G AI
            </Text>
          </Pressable>

          <Pressable
            style={styles.portfolioButton}
            onPress={() => router.push("/portfolio")}
          >
            <Text style={styles.buttonText}>
              Portfolio + P&L
            </Text>
          </Pressable>

          <Pressable
            style={styles.adminButton}
            onPress={() => router.push("/admin")}
          >
            <Text style={styles.buttonText}>
              Admin / Broker Ops
            </Text>
          </Pressable>
        <Pressable
  style={styles.orderBookButton}
  onPress={() => router.push("/orderbook")}
>
  <Text style={styles.buttonText}>
    Market Depth
  </Text>
</Pressable>

<Pressable
  style={styles.executionAdvisorButton}
  onPress={() => router.push("/execution-advisor")}
>
  <Text style={styles.buttonText}>
    Execution Advisor
  </Text>
</Pressable>

<Pressable
  style={styles.orderSplitterButton}
  onPress={() => router.push("/order-splitter")}
>
  <Text style={styles.buttonText}>
    Smart Order Splitter
  </Text>
</Pressable>

<Pressable
  style={styles.childOrdersButton}
  onPress={() => router.push("/child-orders")}
>
  <Text style={styles.buttonText}>
    Child Order Monitor
  </Text>
</Pressable>

<Pressable
  style={styles.complianceButton}
  onPress={() => router.push("/compliance")}
>
  <Text style={styles.buttonText}>
    Compliance + Audit
  </Text>
</Pressable>

		</View>

        <Pressable style={styles.logout} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {portfolio && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Portfolio Value
          </Text>

          <Text style={styles.cardValue}>
            KES {portfolio.totalMarketValue}
          </Text>

          <Text style={styles.green}>
            Unrealized P&L: KES {portfolio.totalUnrealizedPnL}
          </Text>

          <Text style={styles.meta}>
            Buying Power: KES {portfolio.availableBuyingPower}
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Coach G Signals
        </Text>

        {signals.map((signal, index) => (
          <View key={index} style={styles.signalCard}>
            <View>
              <Text style={styles.signalSymbol}>
                {signal.symbol}
              </Text>

              <Text style={styles.meta}>
                Confidence {signal.confidence}%
              </Text>
            </View>

            <Text
              style={
                signal.recommendation.includes("BUY")
                  ? styles.green
                  : styles.red
              }
            >
              {signal.recommendation}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Watchlist
        </Text>

        {watchlist.map((item, index) => (
          <View key={index} style={styles.watchCard}>
            <View>
              <Text style={styles.watchSymbol}>
                {item.symbol}
              </Text>

              <Text style={styles.meta}>
                KES {item.price}
              </Text>
            </View>

            <Text
              style={
                item.change >= 0
                  ? styles.green
                  : styles.red
              }
            >
              {item.changePct}%
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Notifications
        </Text>

        {notifications.slice(0, 5).map((notification, index) => (
          <View key={index} style={styles.notificationCard}>
            <Text style={styles.notificationType}>
              {notification.type}
            </Text>

            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
          </View>
        ))}
      </View>
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "800"
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: 4,
    marginBottom: 10
  },

  card: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20
  },

  cardLabel: {
    color: "#94a3b8",
    marginBottom: 8
  },

  cardValue: {
    color: "#22d3ee",
    fontSize: 30,
    fontWeight: "800"
  },

  section: {
    marginBottom: 24
  },

  sectionTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12
  },

  signalCard: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },

  watchCard: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  },

  notificationCard: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10
  },

  signalSymbol: {
    color: "white",
    fontSize: 18,
    fontWeight: "800"
  },

  watchSymbol: {
    color: "white",
    fontSize: 18,
    fontWeight: "800"
  },

  notificationType: {
    color: "#22d3ee",
    fontWeight: "800",
    marginBottom: 4
  },

  notificationMessage: {
    color: "#e2e8f0"
  },

  meta: {
    color: "#94a3b8",
    marginTop: 4
  },

  green: {
    color: "#22c55e",
    fontWeight: "800"
  },

  red: {
    color: "#ef4444",
    fontWeight: "800"
  },

  tradeButton: {
    marginTop: 10,
    backgroundColor: "#0891b2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start"
  },

  coachButton: {
    marginTop: 10,
    backgroundColor: "#16a34a",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start"
  },

  portfolioButton: {
    marginTop: 10,
    backgroundColor: "#7c3aed",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start"
  },

  adminButton: {
    marginTop: 10,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start"
  },
  orderBookButton: {
  marginTop: 10,
  backgroundColor: "#0f766e",
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 12,
  alignSelf: "flex-start"
},
executionAdvisorButton: {
  marginTop: 10,
  backgroundColor: "#2563eb",
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 12,
  alignSelf: "flex-start"
},
orderSplitterButton: {
  marginTop: 10,
  backgroundColor: "#9333ea",
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 12,
  alignSelf: "flex-start"
},
childOrdersButton: {
  marginTop: 10,
  backgroundColor: "#0ea5e9",
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 12,
  alignSelf: "flex-start"
},
complianceButton: {
  marginTop: 10,
  backgroundColor: "#b91c1c",
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: 12,
  alignSelf: "flex-start"
},

  buttonText: {
    color: "white",
    fontWeight: "800"
  },

  logout: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12
  },

  logoutText: {
    color: "white",
    fontWeight: "800"
  }
});