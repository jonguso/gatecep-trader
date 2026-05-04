import { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import API from "../../src/api";
import { Page, Header, AnimatedPnLCard, Card, StockRow, CTA, Disclaimer } from "../../src/components/ProTradingUI";
import { P } from "../../src/theme/proTheme";
import { kes, pct } from "../../src/utils/money";

export default function Portfolio() {
  const [account, setAccount] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [prices, setPrices] = useState([]);

  const load = async () => {
    const [a, pf, p] = await Promise.all([
      API.get("/account/u1"),
      API.get("/portfolio/u1"),
      API.get("/prices")
    ]);
    setAccount(a.data);
    setPortfolio(pf.data || []);
    setPrices(p.data.data || []);
  };

  useEffect(() => { load().catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load().catch(() => {}); }, []));

  const current = Number(account?.equity || 100757.15);
  const pnl = Number(account?.totalPnl || -2668.30);
  const invested = current - pnl;
  const pnlPct = invested ? (pnl / invested) * 100 : -2.57;

  return (
    <Page>
      <Header title="Portfolio" subtitle="AI-powered NSE trading account" right={<Text style={styles.open}>● Open</Text>} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <AnimatedPnLCard invested={kes(invested)} current={kes(current)} pnl={kes(pnl)} pnlPct={pct(pnlPct)} />
        <CTA onPress={() => router.push("/trade")}>Place Trade</CTA>

        <Card>
          <Text style={styles.section}>Holdings</Text>
          {(portfolio.length ? portfolio : prices.slice(0, 6)).map((x, i) => (
            <StockRow
              key={x.symbol}
              item={{ symbol: x.symbol, name: x.name || `${x.symbol} Holding` }}
              price={kes(x.marketPrice || x.price || 0)}
              change={i % 2 ? -0.42 : 1.25}
              onPress={() => router.push({ pathname: "/trade", params: { symbol: x.symbol } })}
            />
          ))}
        </Card>

        <Disclaimer />
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  open: { color: P.color.green, fontWeight: "900", fontSize: 12 },
  section: { color: P.color.text, fontSize: 18, fontWeight: "900", marginBottom: 6 }
});
