import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, StyleSheet, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import API from "../../src/api";
import { Page, Header, Card, CTA, InfoRow, Disclaimer } from "../../src/components/ProTradingUI";
import PortfolioHoldingRow from "../../src/components/PortfolioHoldingRow";
import AvailableFundsCard from "../../src/components/AvailableFundsCard";
import { P } from "../../src/theme/proTheme";
import { kes, pct } from "../../src/utils/money";

function mergePortfolioWithPrices(portfolioRows, priceRows) {
  const priceMap = Object.fromEntries(
    (priceRows || []).map(x => [x.symbol, Number(x.price || x.lastPrice || x.marketPrice || 0)])
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

      return {
        ...h,
        qty,
        avgPrice,
        marketPrice,
        marketValue,
        investedValue,
        unrealizedPnl,
        totalPnl: Number(h.realizedPnl || 0) + unrealizedPnl
      };
    });
}

function calculatePendingOrders(orderRows) {
  return (orderRows || [])
    .filter(o => ["PENDING", "OPEN", "ROUTED", "ACCEPTED"].includes(String(o.status || "").toUpperCase()))
    .reduce((sum, o) => {
      if (String(o.side || "").toUpperCase() !== "BUY") return sum;
      return sum + Number(o.price || 0) * Number(o.qty || o.originalQty || 0);
    }, 0);
}

export default function Portfolio() {
  const [account, setAccount] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [prices, setPrices] = useState([]);
  const [orders, setOrders] = useState([]);

  const load = async () => {
    const [a, pf, p, o] = await Promise.all([
      API.get("/account/u1"),
      API.get("/portfolio/u1"),
      API.get("/prices"),
      API.get("/orders?userId=u1")
    ]);

    setAccount(a.data);
    setPortfolio(pf.data || []);
    setPrices(p.data.data || []);
    setOrders(o.data || []);
  };

  const clearPendingOrders = async () => {
    try {
      const res = await API.post("/orders/clear-pending", { userId: "u1" });
      await load();
      Alert.alert("Pending Orders Cleared", `${res.data.cleared || 0} pending order(s) cleared.`);
    } catch (e) {
      Alert.alert("Clear Failed", e.response?.data?.error || "Could not clear pending orders.");
    }
  };

  useEffect(() => { load().catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load().catch(() => {}); }, []));

  const holdings = useMemo(() => mergePortfolioWithPrices(portfolio, prices), [portfolio, prices]);

  const investedValue = holdings.reduce((sum, h) => sum + Number(h.investedValue || 0), 0);
  const holdingsCurrentValue = holdings.reduce((sum, h) => sum + Number(h.marketValue || 0), 0);
  const pnl = holdingsCurrentValue - investedValue;
  const pnlPct = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

  const ledgerBalance = Number(account?.cash || 0);
  const pendingPayments = 0;
  const pendingOrders = calculatePendingOrders(orders);
  const pendingTotal = pendingPayments + pendingOrders;
  const availableFunds = ledgerBalance - pendingTotal;
  const totalEquity = holdingsCurrentValue + availableFunds;

  return (
    <Page>
      <Header
        title="Portfolio"
        subtitle="Available Funds = Ledger Balance - Pending Total"
        right={<Text style={styles.open}>● Open</Text>}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <AvailableFundsCard
          availableFunds={availableFunds}
          ledgerBalance={ledgerBalance}
          pendingTotal={pendingTotal}
          pnl={pnl}
          pnlPct={pnlPct}
          formatMoney={kes}
          formatPct={pct}
        />

        <Card>
          <Text style={styles.section}>Portfolio Summary</Text>
          <InfoRow label="Available Funds" value={kes(availableFunds)} />
          <InfoRow label="Ledger Balance" value={kes(ledgerBalance)} />
          <InfoRow label="Pending Payments" value={kes(pendingPayments)} />
          <InfoRow label="Pending Orders" value={kes(pendingOrders)} />
          <InfoRow label="Holdings Current Value" value={kes(holdingsCurrentValue)} />
          <InfoRow label="Invested Value" value={kes(investedValue)} />
          <InfoRow label="Unrealized P&L" value={kes(pnl)} tone={pnl >= 0 ? "green" : "red"} />
          <InfoRow label="Total Equity" value={kes(totalEquity)} />
        </Card>

        {pendingOrders > 0 && <CTA tone="sell" onPress={clearPendingOrders}>Clear Pending Orders</CTA>}

        <CTA onPress={() => router.push("/trade")}>Place Trade</CTA>

        <Card>
          <Text style={styles.section}>Holdings</Text>

          {holdings.length === 0 && (
            <Text style={styles.empty}>No holdings yet. Buy shares from the Trade tab to populate your portfolio.</Text>
          )}

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
