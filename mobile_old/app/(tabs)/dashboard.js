import { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import API from "../../src/api";
import { Page } from "../../src/components/ProTradingUI";
import BrokerHeader from "../../src/components/BrokerHeader";
import useMarketData from "../../src/hooks/useMarketData";
import { kes } from "../../src/utils/money";
import { getMarketStatus, getStatusStyle } from "../../src/utils/marketStatus";
import AppTopBar from "../../src/components/AppTopBar";
import SideMenu from "../../src/components/SideMenu";

export default function Dashboard() {
  const [tab, setTab] = useState("Gainers");
  const { rows } = useMarketData();
  const [account, setAccount] = useState({ cash: 0 });
  const [holdings, setHoldings] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.all([API.get("/account/u1"), API.get("/portfolio/u1")])
      .then(([a, h]) => {
        setAccount(a.data || { cash: 0 });
        setHoldings(h.data || []);
      })
      .catch(() => {});
  }, []);

  const status = getMarketStatus(now);
  const statusStyle = getStatusStyle(status);
const [menuOpen, setMenuOpen] = useState(false);

  const marketMap = Object.fromEntries(rows.map(x => [x.symbol, x]));
  const invested = holdings.reduce((s, h) => s + Number(h.qty || 0) * Number(h.avgPrice || 0), 0);
  const current = holdings.reduce((s, h) => s + Number(h.qty || 0) * Number(marketMap[h.symbol]?.price || h.avgPrice || 0), 0);
  const pnl = current - invested;

  const gainers = useMemo(
    () => rows.filter(x => Number(x.changePct || 0) > 0).sort((a, b) => Number(b.changePct || 0) - Number(a.changePct || 0)).slice(0, 10),
    [rows]
  );

  const losers = useMemo(
    () => rows.filter(x => Number(x.changePct || 0) < 0).sort((a, b) => Number(a.changePct || 0) - Number(b.changePct || 0)).slice(0, 5),
    [rows]
  );

  const movers = useMemo(
    () => [...rows].sort((a, b) => Number(b.turnover || 0) - Number(a.turnover || 0)).slice(0, 5),
    [rows]
  );

  const list = tab === "Gainers" ? gainers : tab === "Losers" ? losers : movers;

  const openSecurity = (symbol) => {
    router.push(`/security/${symbol}`);
  };

  return (
    <Page>
      <AppTopBar
  title="Dashboard"
  onMenuPress={() => setMenuOpen(true)}
/>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>AVAILABLE FUNDS</Text>
          <Text style={styles.available}>{kes(account.cash)}</Text>

          <View style={styles.two}>
            <View>
              <Text style={styles.muted}>Invested</Text>
              <Text style={styles.value}>{kes(invested)}</Text>
            </View>
            <View>
              <Text style={styles.muted}>Current</Text>
              <Text style={styles.value}>{kes(current)}</Text>
            </View>
          </View>

          <Text style={[styles.pnl, { color: pnl >= 0 ? "#22C55E" : "#EF4444" }]}>
            {pnl >= 0 ? "▲" : "▼"} {kes(pnl)}
          </Text>
        </View>

        <View style={styles.tiles}>
          <ActionTile
            icon="stats-chart-outline"
            label="Market Sentiment"
            onPress={() => Alert.alert("Market Sentiment", `Gainers: ${gainers.length}\nLosers: ${losers.length}\nStatus: ${status.detail}`)}
          />
          <ActionTile
            icon="flame-outline"
            label="AI Hot Stocks"
            onPress={() => Alert.alert("AI Hot Stocks", movers.slice(0, 3).map(x => `${x.symbol} · Turnover ${kes(x.turnover || 0)}`).join("\n") || "No hot stocks yet.")}
          />
          <ActionTile
            icon="time-outline"
            label="Session Status"
            onPress={() => Alert.alert("Session Status", `${status.label}\n${status.detail}`)}
          />
        </View>

        <View style={styles.tabs}>
          {["Gainers", "Losers", "Movers"].map(x => (
            <Pressable key={x} onPress={() => setTab(x)} style={[styles.tab, tab === x && styles.active]}>
              <Text style={[styles.tabText, tab === x && styles.activeText]}>{x}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.table}>
          <View style={styles.header}>
            <Text style={styles.th}>Symbol</Text>
            <Text style={styles.th}>{tab === "Movers" ? "Turnover" : "Price"}</Text>
            {tab !== "Movers" && <Text style={styles.th}>Change</Text>}
          </View>

          {list.length === 0 ? (
            <Text style={styles.empty}>No records found.</Text>
          ) : (
            list.map(x => (
              <Pressable key={x.symbol} onPress={() => openSecurity(x.symbol)} style={styles.row}>
                <Text style={styles.symbol}>{x.symbol}</Text>
                <Text style={styles.td}>
                  {tab === "Movers" ? kes(x.turnover || 0) : Number(x.price || 0).toFixed(2)}
                </Text>
                {tab !== "Movers" && (
                  <Text style={[styles.td, { color: Number(x.changePct || 0) >= 0 ? "#22C55E" : "#EF4444" }]}>
                    {Number(x.changePct || 0) >= 0 ? "▲" : "▼"} {Number(x.changePct || 0).toFixed(2)}%
                  </Text>
                )}
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
<SideMenu
  visible={menuOpen}
  onClose={() => setMenuOpen(false)}
/>
    </Page>
  );
}

function ActionTile({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.tile}>
      <Ionicons name={icon} size={28} color="#0EA5E9" />
      <Text style={styles.tileText}>{label}</Text>
      <Text style={styles.tapText}>Tap</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { backgroundColor: "#08111F" },
  badge: {
    fontWeight: "900",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    overflow: "hidden"
  },
  card: {
    backgroundColor: "#111D35",
    margin: 18,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,.28)"
  },
  label: { color: "#94A3B8", fontSize: 11, fontWeight: "900" },
  available: { color: "#FFFFFF", fontSize: 34, fontWeight: "900", marginTop: 8 },
  two: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(148,163,184,.28)",
    marginTop: 18,
    paddingTop: 14
  },
  muted: { color: "#94A3B8", fontSize: 12 },
  value: { color: "#FFFFFF", fontWeight: "900", marginTop: 3 },
  pnl: { fontWeight: "900", marginTop: 12 },
  tiles: { flexDirection: "row", gap: 10, marginHorizontal: 18 },
  tile: {
    flex: 1,
    backgroundColor: "#111D35",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,.18)"
  },
  tileText: { color: "#E5E7EB", fontSize: 11, textAlign: "center", marginTop: 8 },
  tapText: { color: "#38BDF8", fontSize: 10, marginTop: 5, fontWeight: "900" },
  tabs: { flexDirection: "row", gap: 10, margin: 18 },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  active: { backgroundColor: "#0B5CFF", borderColor: "#0B5CFF" },
  tabText: { color: "#CBD5E1", fontWeight: "800" },
  activeText: { color: "#FFFFFF" },
  table: {
    marginHorizontal: 18,
    marginBottom: 24,
    backgroundColor: "#111D35",
    borderRadius: 16,
    overflow: "hidden"
  },
  header: { flexDirection: "row", backgroundColor: "#16233F", paddingVertical: 12 },
  th: { flex: 1, color: "#94A3B8", fontWeight: "900", paddingHorizontal: 10 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,.18)",
    paddingVertical: 16
  },
  symbol: { flex: 1, color: "#FFFFFF", fontWeight: "900", paddingHorizontal: 10 },
  td: { flex: 1, color: "#FFFFFF", fontWeight: "700", paddingHorizontal: 10 },
  empty: { color: "#94A3B8", textAlign: "center", padding: 20 }
});
