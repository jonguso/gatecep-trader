import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import API from "../../src/api";
import { Page, Header, Segments, Card, StockRow, ActionSheet, CoachPrompt, Disclaimer } from "../../src/components/ProTradingUI";
import { P } from "../../src/theme/proTheme";
import { kes } from "../../src/utils/money";

export default function Markets() {
  const [tab, setTab] = useState("Gainers");
  const [prices, setPrices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [coach, setCoach] = useState(false);

  const load = async () => {
    const p = await API.get("/prices");
    setPrices(p.data.data || []);
  };

  useEffect(() => { load().catch(() => {}); }, []);

  const rows = useMemo(() => {
    const enriched = prices.map((x, i) => ({
      ...x,
      change: tab === "Losers" ? -1 * (0.5 + i * 0.22) : 0.8 + i * 0.31,
      volume: 1000 + i * 2500
    }));
    if (tab === "Losers") return enriched.sort((a, b) => a.change - b.change);
    if (tab === "Movers") return enriched.sort((a, b) => b.volume - a.volume);
    return enriched.sort((a, b) => b.change - a.change);
  }, [prices, tab]);

  const goTrade = (side) => {
    const stock = selected;
    setSelected(null);
    setCoach(false);
    router.push({ pathname: "/trade", params: { symbol: stock?.symbol || "SCOM", side } });
  };

  return (
    <Page>
      <Header title="Markets" subtitle="Swipe/tap a stock to buy, sell, or ask Coach G" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Segments tabs={["Gainers", "Losers", "Movers"]} active={tab} onChange={setTab} />

        <Card>
          <Text style={styles.section}>{tab}</Text>
          {rows.map(x => (
            <StockRow
              key={x.symbol}
              item={x}
              price={kes(x.price)}
              change={x.change}
              onPress={() => setSelected(x)}
              onLongPress={() => setSelected(x)}
            />
          ))}
        </Card>

        <Disclaimer />
      </ScrollView>

      <ActionSheet
        visible={!!selected}
        stock={selected}
        onClose={() => setSelected(null)}
        onCoach={() => { setCoach(true); }}
        onBuy={() => goTrade("BUY")}
        onSell={() => goTrade("SELL")}
      />

      <CoachPrompt
        visible={coach}
        stock={selected}
        onClose={() => setCoach(false)}
        onBuy={() => goTrade("BUY")}
        onSell={() => goTrade("SELL")}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { color: P.color.text, fontSize: 18, fontWeight: "900", marginBottom: 6 }
});
