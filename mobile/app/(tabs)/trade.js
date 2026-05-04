import { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import API from "../../src/api";
import { Card, Chip, PrimaryButton, RiskDisclaimer } from "../../src/components/NSEUI";
import { TOKENS } from "../../src/theme/tokens";
import { formatKES, orderReference } from "../../src/utils/format";

export default function Trade() {
  const params = useLocalSearchParams();
  const [symbol, setSymbol] = useState(params.symbol || "SCOM");
  const [side, setSide] = useState("BUY");
  const [orderType, setOrderType] = useState("Limit");
  const [price, setPrice] = useState("15");
  const [qty, setQty] = useState("100");
  const [result, setResult] = useState(null);

  useEffect(() => { if (params.symbol) setSymbol(params.symbol); }, [params.symbol]);

  const notional = Number(price || 0) * Number(qty || 0);
  const nseLevy = notional * TOKENS.fees.nseLevy;
  const brokerFee = notional * TOKENS.fees.brokerCommission;
  const cdsFee = side === "BUY" ? notional * TOKENS.fees.cdsFee : 0;
  const cdscLevy = notional * TOKENS.fees.cdscLevy;
  const total = side === "BUY" ? notional + nseLevy + brokerFee + cdsFee + cdscLevy : notional - nseLevy - brokerFee - cdscLevy;

  const submit = async () => {
    try {
      const res = await API.post("/order", { userId: "u1", symbol, side, price: Number(price), qty: Number(qty) });
      setResult({ ...res.data, ref: orderReference(symbol) });
    } catch (e) {
      alert(e.response?.data?.error || "Order failed");
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Buy / Sell</Text>
      <Text style={styles.subtitle}>Review fees and settlement before sending to your broker.</Text>

      <Card>
        <View style={styles.segment}>
          {["SCOM", "KCB", "EQTY", "EABL", "COOP"].map(x => (
            <Chip key={x} label={x} active={symbol === x} onPress={() => setSymbol(x)} />
          ))}
        </View>

        <View style={styles.segment}>
          <Chip label="BUY" active={side === "BUY"} tone="up" onPress={() => setSide("BUY")} />
          <Chip label="SELL" active={side === "SELL"} tone="down" onPress={() => setSide("SELL")} />
        </View>

        <View style={styles.segment}>
          {["Market", "Limit", "Stop"].map(x => <Chip key={x} label={x} active={orderType === x} onPress={() => setOrderType(x)} />)}
        </View>

        <Text style={styles.label}>Limit Price</Text>
        <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />

        <Text style={styles.label}>Quantity</Text>
        <TextInput value={qty} onChangeText={setQty} keyboardType="numeric" style={styles.input} />
      </Card>

      <Card caption="Fee Summary" title="Estimated Total">
        <FeeRow label="Subtotal" value={formatKES(notional)} />
        <FeeRow label="NSE levy 0.12%" value={formatKES(nseLevy)} />
        <FeeRow label="Broker 1.5%" value={formatKES(brokerFee)} />
        {side === "BUY" && <FeeRow label="CDS fee 0.06%" value={formatKES(cdsFee)} />}
        <FeeRow label="CDSC levy 0.05%" value={formatKES(cdscLevy)} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{side === "BUY" ? "Amount Payable" : "Estimated Proceeds"}</Text>
          <Text style={styles.totalValue}>{formatKES(total)}</Text>
        </View>
        <Text style={styles.settlement}>Settlement: {TOKENS.settlement.cycle} · CDS credit after matching and clearing</Text>
      </Card>

      <PrimaryButton tone={side === "BUY" ? "buy" : "sell"} onPress={submit}>
        Confirm {side} Order
      </PrimaryButton>

      {result && (
        <Card caption="Order Confirmation" title="Order Sent">
          <Text style={styles.success}>✓ Reference {result.ref}</Text>
          <Text style={styles.body}>{result.message || "Order routed to selected broker."}</Text>
        </Card>
      )}

      <RiskDisclaimer />
    </ScrollView>
  );
}

function FeeRow({ label, value }) {
  return <View style={styles.feeRow}><Text style={styles.feeLabel}>{label}</Text><Text style={styles.feeValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: TOKENS.color.bg },
  content: { padding: TOKENS.spacing.screen, paddingBottom: 32 },
  title: { ...TOKENS.type.h1, color: TOKENS.color.text },
  subtitle: { ...TOKENS.type.caption, color: TOKENS.color.textSecondary, marginTop: 4, marginBottom: 14 },
  segment: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  label: { ...TOKENS.type.caption, color: TOKENS.color.textSecondary, marginTop: 8, marginBottom: 4 },
  input: {
    height: TOKENS.layout.fieldHeight,
    backgroundColor: TOKENS.color.bg,
    color: TOKENS.color.text,
    borderWidth: 1,
    borderColor: TOKENS.color.border,
    borderRadius: TOKENS.radius.md,
    paddingHorizontal: 12
  },
  feeRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  feeLabel: { color: TOKENS.color.textSecondary, fontSize: 13 },
  feeValue: { color: TOKENS.color.text, fontWeight: "700" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: TOKENS.color.border, paddingTop: 10, marginTop: 6 },
  totalLabel: { color: TOKENS.color.text, fontWeight: "800" },
  totalValue: { color: TOKENS.color.brandLight, fontWeight: "900" },
  settlement: { color: TOKENS.color.textSecondary, fontSize: 11, marginTop: 10 },
  success: { color: TOKENS.color.up, fontWeight: "900", marginBottom: 8 },
  body: { color: TOKENS.color.text, lineHeight: 20 }
});
