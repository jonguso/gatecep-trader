import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { calculatePortfolioAnalytics } from "../../src/utils/portfolioAnalytics";
import { revalueHoldingsWithDemoPrices } from "../../src/utils/demoMarketEngine";
import { getMarketSentiment } from "../../src/utils/marketSentiment";
import { generatePortfolioAlerts } from "../../src/utils/portfolioAlerts";


export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [setupReady, setSetupReady] = useState(false);
  const [marketMood,setMarketMood] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [setupChecks, setSetupChecks] = useState({
    profile: false,
    broker: false,
    portfolio: false
  });

  useEffect(() => {
  load();
}, []);

useFocusEffect(
  useCallback(() => {
    load();
    setMarketMood(getMarketSentiment());

    const timer = setInterval(() => {
      load();
      setMarketMood(getMarketSentiment());
    }, 10000);

    return () => clearInterval(timer);
  }, [])
);

  async function load() {
    const profileRaw = await AsyncStorage.getItem("gatecepInvestorProfile");
    const brokerRaw =
      (await AsyncStorage.getItem("gatecepBrokerProfile")) ||
      (await AsyncStorage.getItem("gatecepDefaultBrokerProfile"));
    const portfolioRaw = await AsyncStorage.getItem("gatecepManualPortfolio");
    const cashRaw = await AsyncStorage.getItem("gatecepAvailableCash");
    const tradesRaw = await AsyncStorage.getItem("gatecepSimulatedTrades");

    const rawHoldings = portfolioRaw ? JSON.parse(portfolioRaw) : [];
    const holdings = revalueHoldingsWithDemoPrices(rawHoldings);
    const cash = Number(cashRaw || 0);
    const trades = tradesRaw ? JSON.parse(tradesRaw) : [];

    setSetupChecks({
      profile: !!profileRaw,
      broker: !!brokerRaw,
      portfolio: Array.isArray(holdings) && holdings.length > 0
    });

    const result = calculatePortfolioAnalytics({
      holdings,
      cash,
      trades
    });

await AsyncStorage.setItem(
  "gatecepManualPortfolio",
  JSON.stringify(holdings)
);

    setAnalytics(result);
    setAlerts(
  generatePortfolioAlerts({
    holdings,
    cash,
    risk: result.risk
  })
);

    setSetupReady(true);
  }

  const data = analytics || {
    investedValue: 0,
    currentValue: 0,
    cash: 0,
    netWorth: 0,
    netGainLoss: 0,
    gainLossPct: 0,
    sectorRows: [],
    largestSector: null,
    risk: "BALANCED",
    diversification: "LOW",
    tradeStats: {
      totalTrades: 0,
      buyTrades: 0,
      sellTrades: 0,
      totalFees: 0
    }
  };

  if (
    setupReady &&
    (!setupChecks.profile || !setupChecks.broker || !setupChecks.portfolio)
  ) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Dashboard</Text>

        <Text style={styles.subtitle}>
          Complete setup before portfolio analysis becomes available.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Setup Checklist</Text>

          <ChecklistItem done={setupChecks.profile} label="Investor Profile" />
          <ChecklistItem done={setupChecks.broker} label="Broker Profile" />
          <ChecklistItem done={setupChecks.portfolio} label="Portfolio Setup" />
        </View>

        <Pressable
          style={styles.primary}
          onPress={() => router.replace("/investor-home")}
        >
          <Text style={styles.primaryText}>Return Home</Text>
        </Pressable>
      </ScrollView>
    );
  }

  const largest = data.largestSector;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.subtitle}>
        Portfolio analysis and Coach G recommendations.
      </Text>

      <Text style={styles.updated}>
        Updated {new Date().toLocaleString()}
      </Text>

       {marketMood && (
  <View style={styles.marketCard}>
    <Text style={styles.marketTitle}>NSE Market Mood</Text>
    <Text style={styles.marketMood}>{marketMood.mood}</Text>
    <Text style={styles.marketChange}>{marketMood.change}%</Text>
  </View>
)}

      <View style={styles.summaryBox}>
        <Metric
          label="Invested Value"
          value={`KES ${money(data.investedValue)}`}
          color="white"
        />

        <Metric
          label="Current Value"
          value={`KES ${money(data.currentValue)}`}
          color="#67e8f9"
        />

        <Metric
          label="Net Gain/Loss"
          value={`KES ${money(data.netGainLoss)} (${data.gainLossPct.toFixed(2)}%)`}
          color={data.netGainLoss >= 0 ? "#86efac" : "#fca5a5"}
        />

        <Metric
          label="Available Cash"
          value={`KES ${money(data.cash)}`}
          color="#86efac"
          sub="Broker trading space"
        />

        <Metric
          label="Risk"
          value={data.risk}
          color={data.risk === "HIGH_RISK" ? "#fca5a5" : "#86efac"}
        />

        <Metric
          label="Sectors"
          value={String(data.sectorRows.length)}
          color="#67e8f9"
        />
      </View>

      <View style={styles.twoGrid}>
        <Metric
          label="Diversification"
          value={data.diversification}
          color="#67e8f9"
          highlight="cyan"
        />

        <Metric
          label="Largest Sector"
          value={
            largest
              ? `${largest.sector} (${Number(largest.weight || 0).toFixed(2)}%)`
              : "N/A"
          }
          color="#c084fc"
          highlight="purple"
        />
      </View>

      <View style={styles.coachCard}>
        <Text style={styles.cardTitle}>Coach G Summary</Text>

        <Text style={styles.body}>
          {largest
            ? `${largest.sector} is the largest exposure at ${Number(
                largest.weight || 0
              ).toFixed(2)}%.`
            : "No sector exposure available yet."}
        </Text>

        <Text style={styles.body}>
          Risk is currently {data.risk}. Diversification is {data.diversification}.
          Available cash is KES {money(data.cash)}.
        </Text>
      </View>

      <View style={styles.card}>
  <Text style={styles.cardTitle}>Coach G Alerts</Text>

  {alerts.map((alert, index) => (
    <View key={`${alert.type}-${index}`} style={styles.alertRow}>
      <Text style={styles.alertType}>{alert.type.toUpperCase()}</Text>
      <Text style={styles.alertMessage}>{alert.message}</Text>
    </View>
  ))}
</View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trading Activity</Text>

        <Text style={styles.body}>
          Total Trades: {data.tradeStats.totalTrades}
        </Text>
        <Text style={styles.body}>Buy Orders: {data.tradeStats.buyTrades}</Text>
        <Text style={styles.body}>Sell Orders: {data.tradeStats.sellTrades}</Text>
        <Text style={styles.body}>
          Fees Paid: KES {money(data.tradeStats.totalFees)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sector Allocation</Text>

        {data.sectorRows.length === 0 ? (
          <Text style={styles.body}>No sector data available yet.</Text>
        ) : (
          data.sectorRows.map((sector) => (
            <View key={sector.sector} style={styles.sectorRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectorName}>{sector.sector}</Text>
                <Text style={styles.small}>
                  {sector.securities.length} holdings
                </Text>
              </View>

              <View style={styles.right}>
                <Text style={styles.valueText}>
                  KES {money(sector.totalValue)}
                </Text>
                <Text style={styles.weightText}>
                  {Number(sector.weight || 0).toFixed(2)}%
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.quickGrid}>
        <Pressable
          style={styles.quickCard}
          onPress={() => router.push("/portfolio")}
        >
          <Text style={styles.quickTitle}>Holdings</Text>
          <Text style={styles.quickDesc}>View current positions</Text>
        </Pressable>

        <Pressable
          style={styles.quickCard}
          onPress={() => router.push("/first-trade")}
        >
          <Text style={styles.quickTitle}>First Trade</Text>
          <Text style={styles.quickDesc}>Practice buy/sell simulation</Text>
        </Pressable>

        <Pressable
          style={styles.quickCard}
          onPress={() => router.push("/order-book")}
        >
          <Text style={styles.quickTitle}>Order Book</Text>
          <Text style={styles.quickDesc}>Review simulated orders</Text>
        </Pressable>

        <Pressable
          style={styles.quickCard}
          onPress={() => router.push("/trade-history")}
        >
          <Text style={styles.quickTitle}>Trade History</Text>
          <Text style={styles.quickDesc}>View completed trades</Text>
        </Pressable>

        <Pressable
          style={styles.quickCard}
          onPress={() => router.push("/portfolio-simulator")}
        >
          <Text style={styles.quickTitle}>Simulator</Text>
          <Text style={styles.quickDesc}>Test growth and market scenarios</Text>
        </Pressable>

        <Pressable
          style={styles.quickCard}
          onPress={() => router.push("/investor-home")}
        >
          <Text style={styles.quickTitle}>Home</Text>
          <Text style={styles.quickDesc}>Return to command center</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.primary}
        onPress={() => router.push("/coach")}
      >
        <Text style={styles.primaryText}>Open Coach G</Text>
      </Pressable>
    </ScrollView>
  );
}

function Metric({ label, value, color, sub, highlight }) {
  return (
    <View
      style={[
        styles.metric,
        highlight === "cyan" && styles.metricCyan,
        highlight === "purple" && styles.metricPurple
      ]}
    >
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
    </View>
  );
}

function ChecklistItem({ done, label }) {
  return (
    <View style={styles.checkRow}>
      <Text style={styles.checkLabel}>{label}</Text>
      <Text style={done ? styles.checkDone : styles.checkMissing}>
        {done ? "COMPLETE" : "MISSING"}
      </Text>
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
  title: { color: "white", fontSize: 34, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 22 },
  updated: { color: "#64748b", marginTop: 8, fontSize: 12 },

  summaryBox: {
    marginTop: 22,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },

  twoGrid: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10
  },

  metric: {
    flexGrow: 1,
    width: "47%",
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },

  metricCyan: {
    backgroundColor: "rgba(6,182,212,.10)",
    borderColor: "rgba(6,182,212,.35)"
  },

  metricPurple: {
    backgroundColor: "rgba(147,51,234,.15)",
    borderColor: "rgba(147,51,234,.45)"
  },

  metricLabel: { color: "#94a3b8", fontSize: 12 },
  metricValue: { fontWeight: "900", marginTop: 8 },
  metricSub: { color: "#94a3b8", fontSize: 11, marginTop: 4 },

  card: {
    marginTop: 22,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },

  coachCard: {
    marginTop: 22,
    backgroundColor: "rgba(147,51,234,.12)",
    borderColor: "rgba(147,51,234,.35)",
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
  small: { color: "#94a3b8", marginTop: 4, fontSize: 12 },

  sectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 14
  },

  sectorName: { color: "white", fontWeight: "900" },
  right: { alignItems: "flex-end" },
  valueText: { color: "white", fontWeight: "900" },
  weightText: { color: "#67e8f9", marginTop: 4, fontWeight: "900" },

  quickGrid: { marginTop: 22, gap: 14 },

  quickCard: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },

  quickTitle: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 18
  },

  quickDesc: {
    color: "#94a3b8",
    marginTop: 8,
    lineHeight: 20
  },

  primary: {
    marginTop: 22,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18
  },

  primaryText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900"
  },

  checkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1
  },

marketCard:{
marginTop:20,
padding:18,
borderRadius:20,
backgroundColor:"#0f172a"
},

marketTitle:{
color:"#67e8f9",
fontWeight:"900"
},

marketMood:{
color:"white",
fontSize:28,
fontWeight:"900",
marginTop:8
},

alertRow: {
  marginTop: 12,
  backgroundColor: "#020617",
  borderColor: "#1e293b",
  borderWidth: 1,
  borderRadius: 14,
  padding: 14
},

alertType: {
  color: "#67e8f9",
  fontSize: 11,
  fontWeight: "900"
},

alertMessage: {
  color: "#cbd5e1",
  marginTop: 6,
  lineHeight: 20
},

marketChange:{
color:"#86efac",
marginTop:6
},

  checkLabel: { color: "white", fontWeight: "800" },
  checkDone: { color: "#86efac", fontWeight: "900" },
  checkMissing: { color: "#fca5a5", fontWeight: "900" }
});