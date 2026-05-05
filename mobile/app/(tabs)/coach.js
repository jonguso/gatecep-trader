import { useState } from "react";
import { ScrollView, Text, TextInput, StyleSheet } from "react-native";
import API from "../../src/api";
import { Page, Header, Segments, Card, CTA, Disclaimer } from "../../src/components/ProTradingUI";
import AISignalCard from "../../src/components/AISignalCard";
import { P } from "../../src/theme/proTheme";

export default function Coach() {
  const [symbol, setSymbol] = useState("SCOM");
  const [side, setSide] = useState("BUY");
  const [price, setPrice] = useState("15");
  const [qty, setQty] = useState("100");
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    setLoading(true);
    try {
      const orderValue = Number(price || 0) * Number(qty || 0);
      const totalFees = orderValue * (0.015 + 0.0012 + 0.0005 + (side === "BUY" ? 0.0006 : 0));
      const cashRequired = orderValue + totalFees;

      const res = await API.post("/ai/recommendation", {
        userId: "u1",
        symbol,
        side,
        price: Number(price),
        qty: Number(qty),
        cashRequired
      });

      setRec(res.data);
    } catch (e) {
      alert(e.response?.data?.error || "Could not get recommendation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Header title="Coach G" subtitle="AI trade recommendations with confidence and signals" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Segments tabs={["SCOM", "KCB", "EQTY", "EABL", "COOP", "KPLC"]} active={symbol} onChange={setSymbol} />
        <Segments tabs={["BUY", "SELL"]} active={side} onChange={setSide} />

        <Card>
          <Text style={styles.section}>Trade Setup</Text>

          <Text style={styles.label}>Price</Text>
          <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />

          <Text style={styles.label}>Quantity</Text>
          <TextInput value={qty} onChangeText={setQty} keyboardType="numeric" style={styles.input} />

          <CTA onPress={ask}>{loading ? "Analyzing..." : "Get AI Signal"}</CTA>
        </Card>

        <AISignalCard recommendation={rec} />

        <Disclaimer />
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { color: P.color.text, fontSize: 18, fontWeight: "900", marginBottom: 8 },
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
  }
});
