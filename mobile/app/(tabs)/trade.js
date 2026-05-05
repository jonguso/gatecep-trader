import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, StyleSheet } from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import API from "../../src/api";
import { Page, Header, Segments, Card, CTA, InfoRow, ActivityRow, Disclaimer } from "../../src/components/ProTradingUI";
import { P } from "../../src/theme/proTheme";
import { kes, ref } from "../../src/utils/money";

export default function Trade() {
  const params = useLocalSearchParams();
  const [symbol, setSymbol] = useState(params.symbol || "SCOM");
  const [side, setSide] = useState(params.side || "BUY");
  const [orderType, setOrderType] = useState("Limit");
  const [price, setPrice] = useState("15");
  const [qty, setQty] = useState("100");
  const [orders, setOrders] = useState([]);
  const [account, setAccount] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const load = async () => {
    const [o, a] = await Promise.all([
      API.get("/orders?userId=u1"),
      API.get("/account/u1")
    ]);
    setOrders(o.data || []);
    setAccount(a.data);
  };

  useEffect(() => {
    if (params.symbol) setSymbol(params.symbol);
    if (params.side) setSide(params.side);
  }, [params.symbol, params.side]);

  useEffect(() => { load().catch(() => {}); }, []);
  useFocusEffect(useCallback(() => { load().catch(() => {}); }, []));

  const orderValue = Number(price || 0) * Number(qty || 0);
  const brokerFee = orderValue * 0.015;
  const nseLevy = orderValue * 0.0012;
  const cdsFee = side === "BUY" ? orderValue * 0.0006 : 0;
  const cdscLevy = orderValue * 0.0005;
  const totalFees = brokerFee + nseLevy + cdsFee + cdscLevy;
  const cashRequired = orderValue + totalFees;
  const estimatedProceeds = orderValue - totalFees;

  const submit = async () => {
    try {
      const res = await API.post("/order", {
        userId: "u1",
        symbol,
        side,
        price: Number(price),
        qty: Number(qty)
      });

      setConfirmation({ ...res.data, ref: ref(symbol) });
      await load();
    } catch (e) {
      alert(e.response?.data?.error || "Order failed");
    }
  };

  return (
    <Page>
      <Header title="Trade" subtitle="Broker-grade order accounting" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.section}>Trade Activity</Text>
          {orders.length === 0 && <Text style={styles.empty}>No activity yet. Place your first demo order.</Text>}
          {orders.slice(0, 5).map(o => <ActivityRow key={o.id} item={o} />)}
        </Card>

        <Segments tabs={["SCOM", "KCB", "EQTY", "EABL", "COOP"]} active={symbol} onChange={setSymbol} />
        <Segments tabs={["BUY", "SELL"]} active={side} onChange={setSide} />
        <Segments tabs={["Market", "Limit", "Stop"]} active={orderType} onChange={setOrderType} />

        <Card>
          <Text style={styles.section}>Place Trade</Text>
          <Text style={styles.label}>Price</Text>
          <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />

          <Text style={styles.label}>Quantity</Text>
          <TextInput value={qty} onChangeText={setQty} keyboardType="numeric" style={styles.input} />
        </Card>

        <Card>
          <Text style={styles.section}>Portfolio Impact</Text>
          <InfoRow label="Ledger Balance" value={kes(account?.cash || 0)} />
          <InfoRow label="Order Value" value={kes(orderValue)} />
          <InfoRow label="Broker Fee" value={kes(brokerFee)} />
          <InfoRow label="NSE Levy" value={kes(nseLevy)} />
          {side === "BUY" && <InfoRow label="CDS Fee" value={kes(cdsFee)} />}
          <InfoRow label="CDSC Levy" value={kes(cdscLevy)} />
          <InfoRow
            label={side === "BUY" ? "Cash Required" : "Estimated Proceeds"}
            value={kes(side === "BUY" ? cashRequired : estimatedProceeds)}
            tone={side === "SELL" ? "green" : undefined}
          />
        </Card>

        <CTA tone={side === "BUY" ? "buy" : "sell"} onPress={submit}>
          Confirm {side} Order
        </CTA>

        {confirmation && (
          <Card>
            <Text style={styles.success}>✓ Order Sent</Text>
            <Text style={styles.body}>Reference: {confirmation.ref}</Text>
            <Text style={styles.body}>{confirmation.message || "Order routed to selected broker."}</Text>
            {confirmation.accounting?.fees && (
              <Text style={styles.body}>
                Accounting posted: {side === "BUY" ? kes(confirmation.accounting.fees.cashRequired) : kes(confirmation.accounting.fees.estimatedProceeds)}
              </Text>
            )}
          </Card>
        )}

        <Disclaimer />
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { color: P.color.text, fontSize: 18, fontWeight: "900", marginBottom: 8 },
  empty: { color: P.color.muted, lineHeight: 20 },
  label: { color: P.color.muted, fontSize: 12, marginBottom: 5, marginTop: 8 },
  input: {
    backgroundColor: P.color.bg,
    borderWidth: 1,
    borderColor: P.color.border,
    borderRadius: P.radius.md,
    minHeight: 46,
    paddingHorizontal: 12,
    color: P.color.text,
    fontWeight: "800"
  },
  success: { color: P.color.green, fontSize: 18, fontWeight: "900", marginBottom: 8 },
  body: { color: P.color.text, lineHeight: 20, marginTop: 4 }
});
