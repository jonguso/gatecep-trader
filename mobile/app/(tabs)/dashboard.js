import { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import API from "../../src/api";
import { Card, Metric, PrimaryButton, StockRow, RiskDisclaimer, LoadingCard } from "../../src/components/NSEUI";
import { TOKENS } from "../../src/theme/tokens";
import { formatKES, formatPercent } from "../../src/utils/format";

export default function Dashboard() {
  const [account, setAccount] = useState(null);
  const [prices, setPrices] = useState([]);

  const load = async () => {
    const [a, p] = await Promise.all([API.get("/account/u1"), API.get("/prices")]);
    setAccount(a.data);
    setPrices(p.data.data || []);
  };

  useEffect(() => { load().catch(() => {}); }, []);

  if (!account) {
    return <ScrollView style={styles.scroll} contentContainerStyle={styles.content}><LoadingCard /></ScrollView>;
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>GOOD MORNING</Text>
      <Text style={styles.title}>Portfolio</Text>

      <Card>
        <Text style={styles.portfolioLabel}>TOTAL VALUE</Text>
        <Text style={styles.portfolioValue}>{formatKES(account.equity)}</Text>
        <Text style={[styles.dailyChange, { color: Number(account.totalPnl || 0) >= 0 ? TOKENS.color.up : TOKENS.color.down }]}>
          {Number(account.totalPnl || 0) >= 0 ? "▲" : "▼"} {formatKES(account.totalPnl || 0)} today
        </Text>

        <View style={styles.metrics}>
          <Metric label="Cash" value={formatKES(account.cash)} />
          <Metric label="Broker" value={account.user?.selectedBrokerId || "-"} tone="brand" />
        </View>

        <PrimaryButton onPress={() => router.push("/trade")}>Buy / Sell Stock</PrimaryButton>
      </Card>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.indexStrip}>
        {["NSE 20", "NASI", "NSE 25", "ETF"].map((x, i) => (
          <View key={x} style={styles.indexChip}>
            <Text style={styles.indexLabel}>{x}</Text>
            <Text style={i % 2 ? styles.indexDown : styles.indexUp}>{i % 2 ? "▼ -0.22%" : "▲ +0.84%"}</Text>
          </View>
        ))}
      </ScrollView>

      <Card caption="Holdings" title="Your Stocks">
        {prices.slice(0, 5).map((x, i) => (
          <StockRow
            key={x.symbol}
            symbol={x.symbol}
            name={x.name}
            price={formatKES(x.price)}
            change={formatPercent(i % 2 ? -0.42 : 1.25)}
            onPress={() => router.push({ pathname: "/trade", params: { symbol: x.symbol } })}
          />
        ))}
      </Card>

      <RiskDisclaimer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: TOKENS.color.bg },
  content: { padding: TOKENS.spacing.screen, paddingBottom: 32 },
  greeting: { ...TOKENS.type.micro, color: TOKENS.color.textSecondary, textTransform: "uppercase" },
  title: { ...TOKENS.type.h1, color: TOKENS.color.text, marginTop: 4, marginBottom: 14 },
  portfolioLabel: { ...TOKENS.type.micro, color: TOKENS.color.textSecondary },
  portfolioValue: { ...TOKENS.type.display, color: TOKENS.color.text, marginTop: 6 },
  dailyChange: { fontSize: 12, fontWeight: "700", marginTop: 6 },
  metrics: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  indexStrip: { marginBottom: 16 },
  indexChip: {
    backgroundColor: TOKENS.color.surface,
    borderRadius: TOKENS.radius.pill,
    borderWidth: 1,
    borderColor: TOKENS.color.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8
  },
  indexLabel: { ...TOKENS.type.micro, color: TOKENS.color.textSecondary },
  indexUp: { color: TOKENS.color.up, fontWeight: "800", marginTop: 3 },
  indexDown: { color: TOKENS.color.down, fontWeight: "800", marginTop: 3 }
});
