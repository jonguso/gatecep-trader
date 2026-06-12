import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";


const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export default function Markets() {
  const [stocks, setStocks] = useState([]);
  const [filter, setFilter] = useState("nse");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    loadMarket();
  }, []);

  async function loadMarket() {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/prices`);
      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.prices)
        ? data.prices
        : [];

      setStocks(list);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      setStocks(fallbackStocks);
      setLastUpdated(new Date().toLocaleString());
    } finally {
      setLoading(false);
    }
  }

  const visibleStocks = useMemo(() => {
    if (filter === "gainers") {
      return stocks
        .filter((x) => Number(x.changePct || 0) > 0)
        .sort((a, b) => Number(b.changePct || 0) - Number(a.changePct || 0));
    }

    if (filter === "losers") {
      return stocks
        .filter((x) => Number(x.changePct || 0) < 0)
        .sort((a, b) => Number(a.changePct || 0) - Number(b.changePct || 0));
    }

    if (filter === "movers") {
      return [...stocks].sort(
        (a, b) => Number(b.turnover || 0) - Number(a.turnover || 0)
      );
    }

    return stocks;
  }, [stocks, filter]);

  const topGainer = [...stocks]
    .filter((x) => Number(x.changePct || 0) > 0)
    .sort((a, b) => Number(b.changePct || 0) - Number(a.changePct || 0))[0];

  const topLoser = [...stocks]
    .filter((x) => Number(x.changePct || 0) < 0)
    .sort((a, b) => Number(a.changePct || 0) - Number(b.changePct || 0))[0];

  const totalTurnover = stocks.reduce(
    (sum, x) => sum + Number(x.turnover || 0),
    0
  );

  const hotStock =
    [...stocks].sort(
      (a, b) => Number(b.turnover || 0) - Number(a.turnover || 0)
    )[0]?.symbol || "N/A";

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#67e8f9" />
        <Text style={styles.loading}>Loading NSE market...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
            <View style={styles.headerRow}>
  <Text style={styles.title}>Markets</Text>

  <Pressable
    style={styles.dashboardButton}
    onPress={() => router.replace("/(tabs)/dashboard")}
  >
    <Text style={styles.dashboardButtonText}>Dashboard</Text>
  </Pressable>
</View>
      <Text style={styles.subtitle}>NSE live market feed powered by Coach G</Text>

      <Text style={styles.updated}>Updated {lastUpdated}</Text>

      <View style={styles.summaryGrid}>
        <MarketMetric
          label="Top Gainer"
          value={topGainer?.symbol || "N/A"}
          sub={`${pct(topGainer?.changePct)}%`}
          color="#86efac"
        />

        <MarketMetric
          label="Top Loser"
          value={topLoser?.symbol || "N/A"}
          sub={`${pct(topLoser?.changePct)}%`}
          color="#fca5a5"
        />

        <MarketMetric
          label="Turnover"
          value={`KES ${money(totalTurnover)}`}
          sub="Market activity"
          color="#67e8f9"
        />

        <MarketMetric
          label="Hot Stock"
          value={hotStock}
          sub="Highest turnover"
          color="#c084fc"
        />
      </View>

      <View style={styles.filterRow}>
        {[
          ["gainers", "Gainers"],
          ["losers", "Losers"],
          ["movers", "Movers"],
          ["nse", "NSE"]
        ].map(([key, label]) => (
          <Pressable
            key={key}
            style={[styles.filterChip, filter === key && styles.filterChipActive]}
            onPress={() => setFilter(key)}
          >
            <Text
              style={
                filter === key ? styles.filterTextActive : styles.filterText
              }
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
        <Text style={styles.subtitle}>NSE market feed powered by Gatecep</Text>
        </Text>

        {visibleStocks.map((item, index) => {
          const change = Number(item.change || 0);
          const changePct = Number(item.changePct || 0);
          const positive = changePct >= 0;

          return (
            <View key={`${item.symbol}-${index}`} style={styles.stockRow}>
  <View style={styles.logoCircle}>
    <Text style={styles.logoText}>
      {String(item.symbol || "?").slice(0, 2)}
    </Text>
  </View>
              <View style={styles.stockLeft}>
                <Text style={styles.symbol}>{item.symbol}</Text>

                <Text style={styles.name}>
                  {item.name || item.companyName || item.symbol}
                </Text>

                <Text style={styles.sector}>{item.sector || "NSE"}</Text>
              </View>

              <View style={styles.stockRight}>
                <Text style={styles.price}>KES {money(item.price || item.lastPrice)}</Text>

                <Text style={positive ? styles.green : styles.red}>
                  {positive ? "▲" : "▼"} {pct(changePct)}%
                </Text>

                <Text style={styles.turnover}>
                  KES {money(item.turnover || item.value || 0)}
                </Text>
              </View>
            </View>
          );
        })}

        {visibleStocks.length === 0 && (
          <Text style={styles.empty}>No securities found for this filter.</Text>
        )}
      </View>
    </ScrollView>
  );
}

function MarketMetric({ label, value, sub, color }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricSub}>{sub}</Text>
    </View>
  );
}

function money(v) {
  return Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function pct(v) {
  return Number(v || 0).toFixed(2);
}

const fallbackStocks = [
  {
    symbol: "SCOM",
    name: "Safaricom",
    sector: "Telecom",
    price: 30.6,
    change: 0.75,
    changePct: 2.53,
    turnover: 128520000
  },
  {
    symbol: "KCB",
    name: "KCB Group",
    sector: "Banking",
    price: 67.75,
    change: -2.35,
    changePct: -3.34,
    turnover: 60297500
  },
  {
    symbol: "BAT",
    name: "BAT Kenya",
    sector: "Mfg. and Allied",
    price: 520,
    change: -17.25,
    changePct: -3.22,
    turnover: 21320000
  },
  {
    symbol: "EABL",
    name: "East African Breweries",
    sector: "Mfg. and Allied",
    price: 248,
    change: -6.25,
    changePct: -2.45,
    turnover: 32240000
  },
  {
    symbol: "ABSA",
    name: "Absa Bank Kenya",
    sector: "Banking",
    price: 29,
    change: -2.78,
    changePct: -8.77,
    turnover: 22040000
  },
  {
    symbol: "KPLC",
    name: "Kenya Power",
    sector: "Energy and Petroleum",
    price: 16.1,
    change: -0.78,
    changePct: -4.6,
    turnover: 15778000
  }
];

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617"
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 120
  },
  center: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center"
  },
  loading: {
    color: "#cbd5e1",
    marginTop: 12
  },
  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "900"
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 8
  },
  updated: {
    color: "#64748b",
    marginTop: 6,
    fontSize: 12
  },
  summaryGrid: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  metric: {
    width: "47%",
    backgroundColor: "#0f172a",
    borderRadius: 16,
    padding: 14
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: 12
  },
  metricValue: {
    marginTop: 8,
    fontWeight: "900",
    fontSize: 15
  },
  metricSub: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 11
  },
  filterRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 8
  },
  filterChip: {
    backgroundColor: "#1e293b",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderColor: "#334155",
    borderWidth: 1
  },
  filterChipActive: {
    backgroundColor: "rgba(147,51,234,.25)",
    borderColor: "#9333ea"
  },
  filterText: {
    color: "#cbd5e1",
    fontWeight: "800",
    fontSize: 12
  },
  filterTextActive: {
    color: "white",
    fontWeight: "900",
    fontSize: 12
  },
  card: {
    marginTop: 18,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16
  },
  cardTitle: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 10
  },

  stockRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 14,
  borderBottomColor: "#1e293b",
  borderBottomWidth: 1
},

  stockLeft: {
    flex: 1
  },
  stockRight: {
    alignItems: "flex-end",
    minWidth: 105
  },
  symbol: {
    color: "white",
    fontWeight: "900",
    fontSize: 16
  },
  name: {
    color: "#cbd5e1",
    marginTop: 4
  },
  sector: {
    color: "#94a3b8",
    marginTop: 3,
    fontSize: 12
  },
  price: {
    color: "white",
    fontWeight: "900"
  },
  green: {
    color: "#86efac",
    marginTop: 4,
    fontWeight: "900"
  },
  red: {
    color: "#fca5a5",
    marginTop: 4,
    fontWeight: "900"
  },
  turnover: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 11
  },
headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12
},

dashboardButton: {
  backgroundColor: "#1e293b",
  borderColor: "#334155",
  borderWidth: 1,
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 14
},

dashboardButtonText: {
  color: "#67e8f9",
  fontWeight: "900"
},
  empty: {
    color: "#94a3b8",
    marginTop: 16
  },

logoCircle: {
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: "#1e293b",
  borderColor: "#334155",
  borderWidth: 1,
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12
},

logoText: {
  color: "#67e8f9",
  fontWeight: "900",
  fontSize: 13
},

});