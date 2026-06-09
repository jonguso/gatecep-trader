import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { calculatePnL } from "../src/utils/performanceHistory";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

export default function Performance() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const raw = await AsyncStorage.getItem("gatecepPerformanceHistory");
    setHistory(raw ? JSON.parse(raw) : []);
  }

  const summary = useMemo(() => calculatePnL(history), [history]);

  const latest = history.length ? history[history.length - 1] : null;
  const first = history.length ? history[0] : null;

  const screenWidth = Dimensions.get("window").width;

const visibleHistory = history.length > 6 ? history.slice(-6) : history;

const chartData = {
  labels: visibleHistory.map((x) =>
    new Date(x.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  ),
  datasets: [
    {
      data: visibleHistory.map((x) => Number(x.totalValue || 0))
    }
  ]
};

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Performance</Text>

      <Text style={styles.subtitle}>
        Track portfolio growth from saved dashboard snapshots.
      </Text>

      <View style={styles.summaryCard}>
        <Metric
          label="Current Value"
          value={`KES ${money(latest?.totalValue || 0)}`}
        />

        <Metric
          label="Starting Value"
          value={`KES ${money(first?.totalValue || 0)}`}
        />

        <Metric
          label="P/L"
          value={`KES ${money(summary.pnl)}`}
          positive={summary.pnl >= 0}
        />

        <Metric
          label="Return"
          value={`${summary.pct.toFixed(2)}%`}
          positive={summary.pct >= 0}
        />
      </View>

<View style={styles.card}>

<Text style={styles.cardTitle}>
Coach G Score
</Text>

<Text style={{
 color:"#86efac",
 fontSize:42,
 fontWeight:"900"
}}>

{summary.pct > 10
 ? "A"
 : summary.pct > 5
 ? "B"
 : summary.pnl >=0
 ? "C"
 : "D"}

</Text>

<Text style={styles.body}>
Generated from return, growth and stability.
</Text>

</View>
      
      <View style={styles.card}>
<View style={styles.card}>
  <Text style={styles.cardTitle}>
    Portfolio Growth
  </Text>

  {history.length < 2 ? (

    <Text style={styles.body}>
      More snapshots needed.
    </Text>

  ) : (

<LineChart
  data={chartData}
  width={screenWidth-60}
  height={220}
  fromZero={false}
withInnerLines={true}
withOuterLines={false}
withVerticalLines={false}
  yAxisSuffix=""
  chartConfig={{
    backgroundGradientFrom:"#0f172a",
    backgroundGradientTo:"#0f172a",
    decimalPlaces:0,
    color:(opacity=1)=>`rgba(103,232,249,${opacity})`,
    labelColor:(opacity=1)=>`rgba(255,255,255,${opacity})`
  }}
  bezier
  style={{
    borderRadius:16,
    marginTop:16
  }}
/>

  )}
</View>

        <Text style={styles.cardTitle}>History</Text>

        {history.length === 0 ? (
          <Text style={styles.body}>No performance history yet.</Text>
        ) : (
          history
            .slice()
            .reverse()
            .map((item, index) => (
              <View key={`${item.timestamp}-${index}`} style={styles.row}>
                <View>
                  <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
                  <Text style={styles.small}>
                    Holdings: KES {money(item.holdingsValue)}
                  </Text>
                  <Text style={styles.small}>Cash: KES {money(item.cash)}</Text>
                </View>

                <Text style={styles.value}>
                  KES {money(item.totalValue)}
                </Text>
              </View>
            ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coach G Performance Notes</Text>

        <Text style={styles.body}>
          • This history is based on dashboard snapshots.
        </Text>
        <Text style={styles.body}>
          • Demo market movement may change values every refresh.
        </Text>
        <Text style={styles.body}>
          • Later this will use live broker and NSE market data.
        </Text>
      </View>

      <Pressable style={styles.primary} onPress={() => router.replace("/coach")}>
        <Text style={styles.primaryText}>Back to Coach G Insights</Text>
      </Pressable>
    </ScrollView>
  );
}

function Metric({ label, value, positive }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text
        style={[
          styles.metricValue,
          positive === true && styles.green,
          positive === false && styles.red
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function formatDate(value) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 100 },
  title: { color: "white", fontSize: 34, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 22 },

  summaryCard: {
    marginTop: 22,
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
  metricValue: { color: "white", fontWeight: "900", marginTop: 6 },

  card: {
    marginTop: 22,
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

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 14
  },

  date: { color: "white", fontWeight: "900" },
  small: { color: "#94a3b8", marginTop: 4, fontSize: 12 },
  value: { color: "#67e8f9", fontWeight: "900", textAlign: "right" },
  body: { color: "#cbd5e1", marginTop: 8, lineHeight: 21 },

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

  green: { color: "#86efac" },
  red: { color: "#fca5a5" }
});