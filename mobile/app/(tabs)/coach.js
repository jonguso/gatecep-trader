import { useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import API from "../../src/api";
import { Page, Header, Segments, Card, CTA, InfoRow, Disclaimer } from "../../src/components/ProTradingUI";
import { P } from "../../src/theme/proTheme";

export default function Coach() {
  const [symbol, setSymbol] = useState("SCOM");
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    setLoading(true);
    try {
      const res = await API.post("/ai/chat", { userId: "u1", symbol });
      setRec(res.data.recommendation || { action: "HOLD", confidence: 50, message: res.data.answer });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Header title="Coach G" subtitle="AI-powered broker-agnostic trading assistant" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Segments tabs={["SCOM", "KCB", "EQTY", "EABL", "COOP"]} active={symbol} onChange={setSymbol} />

        <Card>
          <Text style={styles.question}>Should I buy {symbol}?</Text>
          <Text style={styles.body}>
            Coach G checks broker status, fees, risk profile, liquidity, and portfolio exposure before giving a Buy/Sell/Hold signal.
          </Text>
        </Card>

        <CTA onPress={ask}>{loading ? "Analyzing..." : "Ask Coach G"}</CTA>

        {rec && (
          <Card>
            <Text style={styles.signal}>{rec.action || "HOLD"}</Text>
            <Text style={styles.confidence}>{rec.confidence || 0}% confidence</Text>
            <Text style={styles.body}>{rec.message}</Text>
            <InfoRow label="Broker" value={rec.broker || "Selected Broker"} />
            <InfoRow label="Exposure" value={`${rec.exposurePercent || 0}%`} />
          </Card>
        )}

        <Disclaimer />
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  question: { color: P.color.text, fontSize: 20, fontWeight: "900", marginBottom: 8 },
  body: { color: P.color.muted, lineHeight: 20 },
  signal: { color: P.color.blue, fontSize: 30, fontWeight: "900" },
  confidence: { color: P.color.text, fontWeight: "800", marginBottom: 10 }
});
