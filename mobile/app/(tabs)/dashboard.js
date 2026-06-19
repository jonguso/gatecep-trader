import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import ActiveUserBanner from "../../src/components/ActiveUserBanner";
import { getCurrentSession } from "../../src/auth/authStore";
import { userGetItem } from "../../src/auth/userStorage";
import { loadPortfolio } from "../../src/portfolio/portfolioStore";
import { APP_VERSION } from "../../src/version/versionRegistry";
import {
  INDEX_ROWS,
  MARKET_ROWS
} from "../../src/markets/marketHubData";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [cash, setCash] = useState(0);
  const [lastUpdated, setLastUpdated] = useState("");

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function load() {
    setLoading(true);

    const currentSession = await getCurrentSession();
    const portfolio = (await loadPortfolio({ revalue: true })) || [];
    const cashRaw = await userGetItem("availableCash");

    setSession(currentSession);
    setHoldings(portfolio);
    setCash(Number(cashRaw || 0));
    setLastUpdated(new Date().toLocaleString());
    setLoading(false);
  }

  const investedValue = useMemo(() => {
    return holdings.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0) *
          Number(item.averagePrice || item.averageCost || item.costPrice || 0),
      0
    );
  }, [holdings]);

  const currentValue = useMemo(() => {
    return holdings.reduce(
      (sum, item) => sum + Number(item.marketValue || item.value || 0),
      0
    );
  }, [holdings]);

  const netGainLoss = currentValue - investedValue;
  const gainLossPct =
    investedValue > 0 ? (netGainLoss / investedValue) * 100 : 0;

  const topMovers = useMemo(() => {
    return [...MARKET_ROWS]
      .filter((item) => Number(item.changePct || 0) !== 0)
      .sort(
        (a, b) =>
          Math.abs(Number(b.changePct || 0)) -
          Math.abs(Number(a.changePct || 0))
      )
      .slice(0, 6);
  }, []);

  const watchlistCount = 8;
  const goalTarget = 1000000;
  const goalProgress = goalTarget > 0 ? (currentValue / goalTarget) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#67e8f9" />
        <Text style={styles.loading}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable style={styles.icon} onPress={() => router.push("/menu")}>
          <Text style={styles.iconText}>☰</Text>
        </Pressable>

        <Text style={styles.title}>Dashboard</Text>

        <Pressable style={styles.icon} onPress={() => router.push("/alerts")}>
          <Text style={styles.iconText}>🔔</Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>GateCEP investor command center</Text>
      <Text style={styles.small}>Version {APP_VERSION}</Text>
      <Text style={styles.userLine}>
        Logged in as {session?.username || session?.userId || "Guest"}
      </Text>
      <Text style={styles.timestamp}>Updated {lastUpdated}</Text>

      <ActiveUserBanner />

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total Portfolio Value</Text>

        <Text style={styles.heroValue}>KES {money(currentValue)}</Text>

        <Text style={netGainLoss >= 0 ? styles.green : styles.red}>
          {netGainLoss >= 0 ? "▲" : "▼"} KES {money(netGainLoss)} (
          {gainLossPct.toFixed(2)}%)
        </Text>

        <View style={styles.heroGrid}>
          <MiniMetric label="Invested" value={`KES ${money(investedValue)}`} />
          <MiniMetric label="Cash" value={`KES ${money(cash)}`} />
          <MiniMetric label="Holdings" value={String(holdings.length)} />
          <MiniMetric label="Watchlist" value={String(watchlistCount)} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Market Snapshot</Text>

        {INDEX_ROWS.slice(0, 3).map((item) => (
          <Pressable
            key={item.symbol}
            style={styles.marketRow}
            onPress={() => router.push("/(tabs)/markets")}
          >
            <View>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.small}>{item.name}</Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.value}>{item.value}</Text>
              <Text
                style={Number(item.changePct || 0) >= 0 ? styles.green : styles.red}
              >
                {Number(item.changePct || 0) >= 0 ? "+" : ""}
                {Number(item.changePct || 0).toFixed(2)}%
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Top Movers Today</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {topMovers.map((item) => (
            <View key={item.symbol} style={styles.moverChip}>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text
                style={
                  Number(item.changePct || 0) >= 0 ? styles.green : styles.red
                }
              >
                {Number(item.changePct || 0) >= 0 ? "+" : ""}
                {Number(item.changePct || 0).toFixed(2)}%
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.coachCard}>
        <Text style={styles.coachTitle}>Coach G Recommendation</Text>

        <Text style={styles.coachBadge}>BUY</Text>
        <Text style={styles.coachSymbol}>SCOM</Text>

        <Text style={styles.body}>
          Strong volume accumulation and positive market momentum.
        </Text>

        <View style={styles.confidenceRow}>
          <Text style={styles.small}>Confidence</Text>
          <Text style={styles.green}>87%</Text>
        </View>

        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: "87%" }]} />
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/coach-insights")}
          >
            <Text style={styles.secondaryText}>View Analysis</Text>
          </Pressable>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/(tabs)/trading")}
          >
            <Text style={styles.primaryText}>Trade Now</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.quickGrid}>
        <QuickButton title="Markets" route="/(tabs)/markets" />
        <QuickButton title="Portfolio" route="/portfolio-hub" />
        <QuickButton title="Trading" route="/(tabs)/trading" />
        <QuickButton title="News" route="/(tabs)/news" />
        <QuickButton title="Calendar" route="/(tabs)/calendar" />
        <QuickButton title="Coach G" route="/coach-insights" accent />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Goal Tracker</Text>

        <Text style={styles.goalValue}>KES {money(currentValue)}</Text>

        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(goalProgress, 100)}%` }
            ]}
          />
        </View>

        <Text style={styles.small}>
          Target KES {money(goalTarget)} • {goalProgress.toFixed(1)}% complete
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>

        {[
          "BUY SCOM prepared",
          "Broker profile active",
          "Portfolio valuation updated",
          "Market alert triggered - EABL",
          "Coach G analysis refreshed"
        ].map((item) => (
          <View key={item} style={styles.activityRow}>
            <Text style={styles.body}>• {item}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function MiniMetric({ label, value }) {
  return (
    <View style={styles.miniMetric}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}

function QuickButton({ title, route, accent }) {
  return (
    <Pressable
      style={accent ? styles.quickButtonAccent : styles.quickButton}
      onPress={() => router.push(route)}
    >
      <Text style={styles.quickText}>{title}</Text>
    </Pressable>
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
  center: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center"
  },
  loading: { color: "#cbd5e1", marginTop: 10 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center"
  },
  iconText: { color: "white", fontSize: 22 },
  title: { color: "white", fontSize: 32, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 10 },
  small: { color: "#94a3b8", marginTop: 4, fontSize: 12 },
  userLine: {
    color: "#67e8f9",
    marginTop: 6,
    fontWeight: "900"
  },
  timestamp: { color: "#64748b", marginTop: 6, fontSize: 12 },
  heroCard: {
    marginTop: 18,
    backgroundColor: "rgba(147,51,234,.16)",
    borderColor: "rgba(192,132,252,.35)",
    borderWidth: 1,
    borderRadius: 26,
    padding: 20
  },
  heroLabel: {
    color: "#c4b5fd",
    fontWeight: "900",
    fontSize: 12,
    textTransform: "uppercase"
  },
  heroValue: {
    color: "white",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 8
  },
  heroGrid: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  miniMetric: {
    width: "47%",
    backgroundColor: "rgba(2,6,23,.65)",
    borderColor: "rgba(148,163,184,.18)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12
  },
  miniLabel: { color: "#94a3b8", fontSize: 11 },
  miniValue: {
    color: "white",
    fontWeight: "900",
    marginTop: 6,
    fontSize: 12
  },
  card: {
    marginTop: 16,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  cardTitle: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 12
  },
  marketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 12,
    gap: 12
  },
  symbol: { color: "white", fontWeight: "900", fontSize: 16 },
  value: { color: "white", fontWeight: "900" },
  green: { color: "#86efac", fontWeight: "900", marginTop: 4 },
  red: { color: "#fca5a5", fontWeight: "900", marginTop: 4 },
  moverChip: {
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    minWidth: 88
  },
  coachCard: {
    marginTop: 16,
    backgroundColor: "#0f172a",
    borderColor: "#9333ea",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },
  coachTitle: {
    color: "#c084fc",
    fontWeight: "900",
    fontSize: 18
  },
  coachBadge: {
    color: "#86efac",
    fontWeight: "900",
    marginTop: 14
  },
  coachSymbol: {
    color: "white",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 4
  },
  body: { color: "#cbd5e1", marginTop: 8, lineHeight: 21 },
  confidenceRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  barTrack: {
    marginTop: 10,
    height: 10,
    backgroundColor: "#1e293b",
    borderRadius: 8,
    overflow: "hidden"
  },
  barFill: {
    height: "100%",
    backgroundColor: "#9333ea",
    borderRadius: 8
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#9333ea",
    borderRadius: 16,
    padding: 14
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 14
  },
  primaryText: {
    color: "white",
    fontWeight: "900",
    textAlign: "center"
  },
  secondaryText: {
    color: "#67e8f9",
    fontWeight: "900",
    textAlign: "center"
  },
  quickGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  quickButton: {
    width: "48%",
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    padding: 18
  },
  quickButtonAccent: {
    width: "48%",
    backgroundColor: "#9333ea",
    borderColor: "#c084fc",
    borderWidth: 1,
    borderRadius: 18,
    padding: 18
  },
  quickText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900"
  },
  goalValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "900"
  },
  activityRow: {
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 8
  }
});