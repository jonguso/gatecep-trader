import { useMemo, useState } from "react";
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Page } from "../../src/components/ProTradingUI";
import BrokerHeader from "../../src/components/BrokerHeader";
import useMarketData from "../../src/hooks/useMarketData";
import WatchlistActionModal from "../../src/components/WatchlistActionModal";

function uniqueBySymbol(rows) {
  const map = new Map();

  (rows || []).forEach(x => {
    if (!x?.symbol) return;
    map.set(String(x.symbol).toUpperCase(), {
      ...x,
      symbol: String(x.symbol).toUpperCase()
    });
  });

  return Array.from(map.values());
}

export default function Watchlist() {
  const { rows, connected } = useMarketData();
  const [q, setQ] = useState("");
  const [modalQuery, setModalQuery] = useState("");
  const [watchTab, setWatchTab] = useState("My WatchList 1");
  const [modalMode, setModalMode] = useState(null);
  const [selectedSymbols, setSelectedSymbols] = useState([]);

  const allRows = useMemo(() => uniqueBySymbol(rows), [rows]);

  const visibleSymbols = useMemo(() => {
    if (watchTab === "My WatchList 1") return allRows.map(x => x.symbol);
    return selectedSymbols;
  }, [watchTab, allRows, selectedSymbols]);

  const list = useMemo(() => {
    const search = q.trim().toLowerCase();

    return allRows
      .filter(x => visibleSymbols.includes(x.symbol))
      .filter(x => {
        if (!search) return true;
        return (
          String(x.symbol || "").toLowerCase().includes(search) ||
          String(x.name || "").toLowerCase().includes(search)
        );
      })
      .sort((a, b) => String(a.symbol).localeCompare(String(b.symbol)));
  }, [allRows, visibleSymbols, q]);

  const toggleSecurity = (symbol) => {
    setSelectedSymbols(prev =>
      prev.includes(symbol)
        ? prev.filter(x => x !== symbol)
        : [...prev, symbol]
    );
  };

  return (
    <Page>
      <BrokerHeader
        title="Watchlist"
        subtitle={`All Securities · ${allRows.length} listed · ${connected ? "live" : "fallback"}`}
      />

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.watchTabs}>
          {["My WatchList 1", "My WatchList 2", "My WatchList 3"].map(x => (
            <Pressable key={x} onPress={() => setWatchTab(x)} style={styles.watchTabPress}>
              <Text style={[styles.watch, watchTab === x && styles.activeWatch]}>{x}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.searchBox}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search & Add Scrip"
            placeholderTextColor="#94A3B8"
            style={styles.search}
          />
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => { setModalMode("add"); setModalQuery(""); }} style={styles.actionBtn}>
            <Text style={styles.actionText}>+ Add Securities</Text>
          </Pressable>

          <Pressable onPress={() => { setModalMode("customize"); setModalQuery(""); }} style={styles.actionBtn}>
            <Text style={styles.actionText}>Customize</Text>
          </Pressable>
        </View>

        <View style={styles.header}>
          <Text style={styles.th}>Security▲</Text>
          <Text style={styles.th}>Last Price▲</Text>
          <Text style={styles.th}>Change▲</Text>
          <Text style={styles.th}>High▲</Text>
          <Text style={styles.th}>Low▲</Text>
        </View>

        {list.length === 0 ? (
          <Text style={styles.empty}>
            {watchTab === "My WatchList 1"
              ? "No securities found."
              : "No securities added to this watchlist. Tap + Add Securities."}
          </Text>
        ) : (
          list.map(x => {
            const up = Number(x.changePct || 0) > 0;
            const flat = Number(x.changePct || 0) === 0;

            return (
              <Pressable key={x.symbol} onPress={() => router.push(`/security/${x.symbol}`)} style={styles.row}>
                <Text style={styles.symbol}>⋮⋮ {x.symbol}</Text>
                <Text style={[styles.td, { color: flat ? "#FBBF24" : up ? "#22C55E" : "#EF4444" }]}>
                  {flat ? "═" : up ? "▲" : "▼"} {Number(x.price || 0).toFixed(2)}
                </Text>
                <Text style={styles.td}>{Number(x.changePct || 0).toFixed(2)}</Text>
                <Text style={styles.td}>{Number(x.high || 0).toFixed(2)}</Text>
                <Text style={styles.td}>{Number(x.low || 0).toFixed(2)}</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <WatchlistActionModal
        visible={!!modalMode}
        mode={modalMode}
        onClose={() => setModalMode(null)}
        securities={allRows}
        query={modalQuery}
        setQuery={setModalQuery}
        selected={selectedSymbols}
        toggleSecurity={toggleSecurity}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  body: { backgroundColor: "#08111F" },
  watchTabs: {
    flexDirection: "row",
    backgroundColor: "#06154A",
    paddingHorizontal: 8
  },
  watchTabPress: { flex: 1 },
  watch: {
    color: "#FFFFFF",
    fontWeight: "800",
    textAlign: "center",
    paddingBottom: 12
  },
  activeWatch: {
    color: "#22D3EE",
    borderBottomWidth: 2,
    borderBottomColor: "#22D3EE"
  },
  searchBox: {
    margin: 16,
    borderRadius: 10,
    backgroundColor: "#111D35",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,.28)"
  },
  search: {
    minHeight: 52,
    paddingHorizontal: 16,
    color: "#FFFFFF"
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 12
  },
  actionBtn: {
    minHeight: 34,
    justifyContent: "center"
  },
  actionText: {
    color: "#38BDF8",
    fontWeight: "900"
  },
  header: {
    flexDirection: "row",
    backgroundColor: "#16233F",
    paddingVertical: 12
  },
  th: {
    flex: 1,
    color: "#94A3B8",
    fontWeight: "900",
    fontSize: 11,
    textAlign: "center"
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,.18)",
    paddingVertical: 16,
    alignItems: "center"
  },
  symbol: {
    flex: 1,
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center"
  },
  td: {
    flex: 1,
    color: "#E5E7EB",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700"
  },
  empty: {
    color: "#94A3B8",
    textAlign: "center",
    paddingVertical: 30
  }
});
