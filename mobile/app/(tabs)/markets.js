import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import API from "../../src/api";
import { Page, Header, Segments, Card, ActionSheet, CoachPrompt, Disclaimer } from "../../src/components/ProTradingUI";
import { LiveStockRow } from "../../src/components/LiveMarketUI";
import { P } from "../../src/theme/proTheme";

function makeSpark(base, i) {
  return Array.from({ length: 12 }, (_, x) => Number((base + Math.sin((x + i) / 2) * 1.2 + (x * 0.08)).toFixed(2)));
}

function normalizeFallbackPrices(prices, tab) {
  const enriched = prices.map((x, i) => {
    const price = Number(x.price || x.lastPrice || 0);
    const prevClose = Number(x.prevClose || x.previousClose || price * (1 - (Math.sin(i + 1) * 0.02)));
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
    const volume = Number(x.volume || x.tradedVolume || (i + 1) * 5000);
    const turnover = Number(x.turnover || price * volume);
    const hotScore = (turnover / 1000000) * 0.65 + Math.max(0, changePct) * 0.35;

    return {
      ...x,
      price,
      prevClose,
      changePct: Number(changePct.toFixed(2)),
      volume,
      turnover,
      hotScore,
      isHot: hotScore >= 3 || (changePct > 1 && turnover > 500000),
      spark: makeSpark(price, i)
    };
  });

  if (tab === "Gainers") return enriched.filter(x => x.changePct > 0).sort((a, b) => b.changePct - a.changePct).slice(0, 10);
  if (tab === "Losers") return enriched.filter(x => x.changePct < 0).sort((a, b) => a.changePct - b.changePct).slice(0, 5);
  if (tab === "Movers") return enriched.sort((a, b) => b.turnover - a.turnover).slice(0, 5);
  return enriched;
}

export default function Markets() {
  const [tab, setTab] = useState("Gainers");
  const [prices, setPrices] = useState([]);
  const [rankings, setRankings] = useState(null);
  const [prevPrices, setPrevPrices] = useState({});
  const [selected, setSelected] = useState(null);
  const [coach, setCoach] = useState(false);
  const latestRef = useRef({});

  const load = async () => {
    try {
      const r = await API.get("/market/rankings");
      setRankings(r.data);
      const allRows = [...(r.data.gainers || []), ...(r.data.losers || []), ...(r.data.movers || [])];
      setPrevPrices(latestRef.current);
      latestRef.current = Object.fromEntries(allRows.map(x => [x.symbol, x.price || x.lastPrice]));
      return;
    } catch {
      const p = await API.get("/prices");
      const data = p.data.data || [];
      setPrevPrices(latestRef.current);
      latestRef.current = Object.fromEntries(data.map(x => [x.symbol, x.price]));
      setPrices(data);
    }
  };

  useEffect(() => {
    load().catch(() => {});
    const id = setInterval(() => load().catch(() => {}), 3500);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => {
    if (rankings) {
      const source = tab === "Gainers" ? rankings.gainers : tab === "Losers" ? rankings.losers : rankings.movers;
      return (source || []).map((x, i) => ({ ...x, spark: makeSpark(Number(x.price || x.lastPrice || 0), i) }));
    }
    return normalizeFallbackPrices(prices, tab);
  }, [prices, rankings, tab]);

  const goTrade = (side) => {
    const stock = selected;
    setSelected(null);
    setCoach(false);
    router.push({ pathname: "/trade", params: { symbol: stock?.symbol || "SCOM", side } });
  };

  return (
    <Page>
      <Header
        title="Markets"
        subtitle={rankings?.provider ? `${rankings.provider} rankings · volume + turnover` : "Ranked by price change and turnover"}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Segments tabs={["Gainers", "Losers", "Movers"]} active={tab} onChange={setTab} />

        <Card>
          <Text style={styles.section}>
            {tab === "Movers" ? "Top 5 by Turnover" : tab === "Gainers" ? "Top 10 Gainers" : "Top 5 Losers"}
          </Text>

          {rows.map(x => (
            <LiveStockRow
              key={x.symbol}
              item={x}
              previousPrice={prevPrices[x.symbol]}
              change={x.changePct}
              sparkData={x.spark}
              onPress={() => router.push({ pathname: "/stock/[symbol]", params: { symbol: x.symbol, name: x.name, price: x.price, change: x.changePct, volume: x.volume, turnover: x.turnover } })}
              onLongPress={() => setSelected(x)}
            />
          ))}
        </Card>

        <Text style={styles.hint}>HOT = Coach G liquidity + momentum badge. Tap for chart; long-press to trade.</Text>
        <Disclaimer />
      </ScrollView>

      <ActionSheet
        visible={!!selected}
        stock={selected}
        onClose={() => setSelected(null)}
        onCoach={() => setCoach(true)}
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
  section: { color: P.color.text, fontSize: 18, fontWeight: "900", marginBottom: 6 },
  hint: { color: P.color.muted, fontSize: 12, marginHorizontal: 18, marginBottom: 12 }
});
