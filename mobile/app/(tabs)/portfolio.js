import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import API from "../../src/api";
import { Page, Header, Card, CTA, InfoRow, Disclaimer } from "../../src/components/ProTradingUI";
import PortfolioHoldingRow from "../../src/components/PortfolioHoldingRow";
import AvailableFundsPortfolioCard from "../../src/components/AvailableFundsPortfolioCard";
import { P } from "../../src/theme/proTheme";
import { kes, pct } from "../../src/utils/money";

function mergePortfolioWithPrices(portfolioRows, priceRows) {
  const priceMap = Object.fromEntries(
    (priceRows || []).map(x => [
      x.symbol,
      Number(x.price || x.lastPrice || x.marketPrice || 0)
    ])
  );

  return (portfolioRows || [])
    .filter(h => Number(h.qty || 0) > 0)
    .map(h => {
      const qty = Number(h.qty || 0);
      const avgPrice = Number(h.avgPrice || 0);
      const marketPrice = Number(h.marketPrice || priceMap[h.symbol] || avgPrice || 0);
      const marketValue = qty * marketPrice;
      const investedValue = qty * avgPrice;
      const unrealizedPnl = marketValue - investedValue;

      return { ...h, qty, avgPrice, marketPrice, marketValue, investedValue, unrealizedPnl };
    });
}

export default function Portfolio() {
  const [account, setAccount] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [prices, setPrices] = useState([]);
  const [balances, setBalances] = useState(null);

  const load = async () => {
    const [a, pf, p] = await Promise.all([
      API.get("/account/u1"),
      API.get("/portfolio/u1"),
      API.get("/prices")
    ]);

    setAccount(a.data);
    setPortfolio(pf.data || []);
    setPrices(p.data.data || []);

    try {
      const b = await API.get("/balances/u1");
      setBalances(b.data);
    } catch {
      setBalances(null);
    }
  };

  useEffect(() => { load().catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load().catch(() => {}); }, []));

  const holdings = useMemo(() => mergePortfolioWithPrices(portfolio, prices), [portfolio, prices]);

  const investedValue = holdings.reduce((sum, h) => sum + Number(h.investedValue || 0), 0);
  const currentValue = holdings.reduce((sum, h) => sum + Number(h.marketValue || 0), 0);
  const pnl = currentValue - investedValue;
  const pnlPct = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

  const ledgerBalance = balances?.ledgerBalance ?? Number(account?.cash || 0);
  const pendingOrders = balances?.pendingOrders ?? 0;
  const pendingPayments = balances?.pendingPayments ?? 0;
  const availableFunds = balances?.availableFunds ?? ledgerBalance;
  const totalEquity = ledgerBalance + currentValue;

  return (
    <Page>
      <Header
        title="Portfolio"
        subtitle="Available Funds = Ledger Balance - Pending Orders - Pending Payments"
        right={<Text style={styles.open}>● Open</Text>}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <AvailableFundsPortfolioCard
          availableFunds={availableFunds}
          investedValue={investedValue}
          currentValue={currentValue}
          pnl={pnl}
          pnlPct={pnlPct}
          formatMoney={kes}
          formatPct={pct}
        />

        <Card>
          <Text style={styles.section}>Portfolio Summary</Text>
          <InfoRow label="Available Funds" value={kes(availableFunds)} />
          <InfoRow label="Ledger Balance" value={kes(ledgerBalance)} />
          <InfoRow label="Pending Orders" value={kes(pendingOrders)} />
          <InfoRow label="Pending Payments" value={kes(pendingPayments)} />
          <InfoRow label="Holdings Current Value" value={kes(currentValue)} />
          <InfoRow label="Invested Value" value={kes(investedValue)} />
          <InfoRow label="Unrealized P&L" value={kes(pnl)} tone={pnl >= 0 ? "green" : "red"} />
          <InfoRow label="Total Equity" value={kes(totalEquity)} />
        </Card>

        <CTA onPress={() => router.push("/trade")}>Place Trade</CTA>

        <Card>
          <Text style={styles.section}>Holdings</Text>
          {holdings.length === 0 && <Text style={styles.empty}>No holdings yet.</Text>}
          {holdings.map(h => (
            <PortfolioHoldingRow
              key={h.symbol}
              holding={h}
              onPress={() => router.push({ pathname: "/trade", params: { symbol: h.symbol } })}
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
  section: { color: P.color.text, fontSize: 18, fontWeight: "900", marginBottom: 8 },
  empty: { color: P.color.muted, lineHeight: 20 }
});
