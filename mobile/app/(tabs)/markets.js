import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, StyleSheet, RefreshControl, View } from "react-native";
import { router } from "expo-router";
import API from "../../src/api";
import { Page, Header, Segments, Card, Disclaimer } from "../../src/components/ProTradingUI";
import GlobalAccountHeader from "../../src/components/GlobalAccountHeader";
import { P } from "../../src/theme/proTheme";
import { kes } from "../../src/utils/money";
import { kesCompact, compactNumber } from "../../src/utils/marketFormat";
import { API_BASE_URL } from "../../src/config/env";

function normalizePayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.quotes)) return payload.quotes;
  if (Array.isArray(payload?.securities)) return payload.securities;
  return [];
}

export default function Markets() {
  const [tab, setTab] = useState("Watchlist");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [debug, setDebug] = useState("");

  const load = async () => {
    setLoading(true);
    setApiError("");

    try {
      let response;
      let endpoint = "/market/live";

      try {
        response = await API.get("/market/live");
      } catch {
        endpoint = "/prices";
        response = await API.get("/prices");
      }

      const data = normalizePayload(response.data);
      setRows(data);
      setDebug(`${API_BASE_URL}${endpoint} returned ${data.length} record(s)`);

      if (data.length === 0) {
        setApiError("Backend responded, but no market records were returned.");
      }
    } catch (e) {
      setRows([]);
      setApiError(e?.message || "Could not connect to backend.");
      setDebug(`${API_BASE_URL}/market/live and /prices failed`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const list = useMemo(() => {
    if (tab === "Gainers") {
      return rows.filter(x => Number(x.changePct || 0) > 0).sort((a, b) => Number(b.changePct || 0) - Number(a.changePct || 0)).slice(0, 10);
    }

    if (tab === "Losers") {
      return rows.filter(x => Number(x.changePct || 0) < 0).sort((a, b) => Number(a.changePct || 0) - Number(b.changePct || 0)).slice(0, 5);
    }

    if (tab === "Movers") {
      return [...rows].sort((a, b) => Number(b.turnover || 0) - Number(a.turnover || 0)).slice(0, 5);
    }

    return [...rows].sort((a, b) => String(a.symbol || "").localeCompare(String(b.symbol || "")));
  }, [rows, tab]);

  const sectionTitle =
    tab === "Watchlist" ? "Watchlist - All NSE Securities" :
    tab === "Gainers" ? "Top 10 Gainers" :
    tab === "Losers" ? "Top 5 Losers" :
    "Top 5 by Turnover";

  return (
    <Page>
      <Header title="Markets" />

      <ScrollView
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={P.color.blue} />}
        showsVerticalScrollIndicator={false}
      >
        <GlobalAccountHeader />

        <Segments tabs={["Watchlist", "Gainers", "Losers", "Movers"]} active={tab} onChange={setTab} />

        <Card>
          <Text style={styles.section}>{sectionTitle}</Text>
          {!!debug && <Text style={styles.debug}>{debug}</Text>}

          {apiError && rows.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.errorTitle}>Market data not loading</Text>
              <Text style={styles.errorText}>{apiError}</Text>
              <Text style={styles.errorText}>Test on phone browser: {API_BASE_URL}/prices</Text>
            </View>
          ) : loading && list.length === 0 ? (
            <Text style={styles.empty}>Loading market data...</Text>
          ) : list.length === 0 ? (
            <Text style={styles.empty}>No records found for {tab}. Try Watchlist or refresh.</Text>
          ) : (
            list.map(x => {
              const up = Number(x.changePct || 0) >= 0;
              const price = x.price || x.lastPrice || 0;

              return (
                <Text
                  key={x.symbol}
                  onPress={() => router.push({ pathname: "/trade", params: { symbol: x.symbol, side: "BUY" } })}
                  style={styles.row}
                >
                  {x.symbol}  {x.name || "NSE Security"}{"\n"}
                  <Text style={styles.meta}>
                    {kes(price)} · Vol {compactNumber(x.volume)} · Turnover {kesCompact(x.turnover)}
                  </Text>
                  {"\n"}
                  <Text style={{ color: up ? P.color.green : P.color.red, fontWeight: "900" }}>
                    {up ? "▲" : "▼"} {Number(x.changePct || 0).toFixed(2)}%
                  </Text>
                </Text>
              );
            })
          )}
        </Card>

        <Disclaimer />
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { color: P.color.text, fontSize: 18, fontWeight: "900", marginBottom: 8 },
  debug: { color: P.color.muted, fontSize: 10, marginBottom: 8 },
  row: { color: P.color.text, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: P.color.border, fontWeight: "900" },
  meta: { color: P.color.muted, fontSize: 11, fontWeight: "700" },
  empty: { color: P.color.muted, textAlign: "center", paddingVertical: 34 },
  emptyBox: { backgroundColor: P.color.redSoft, borderWidth: 1, borderColor: P.color.red, borderRadius: P.radius.md, padding: 12 },
  errorTitle: { color: P.color.red, fontWeight: "900", marginBottom: 6 },
  errorText: { color: P.color.text, lineHeight: 18, fontSize: 12, marginTop: 4 }
});
