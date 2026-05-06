import { Modal, View, Text, ScrollView, StyleSheet } from "react-native";
import { P } from "../theme/proTheme";
import { CTA, InfoRow } from "./ProTradingUI";
import { kes } from "../utils/money";

export default function PortfolioDetailsModal({ visible, onClose, account, holdings = [] }) {
  const invested = holdings.reduce((s, h) => s + Number(h.investedValue || 0), 0);
  const current = holdings.reduce((s, h) => s + Number(h.marketValue || 0), 0);
  const pnl = current - invested;
  const totalEquity = Number(account?.cash || 0) + current;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Portfolio Details</Text>
        <Text style={styles.subtitle}>Summary and full holdings breakdown</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.section}>Portfolio Summary</Text>
            <InfoRow label="Available Funds" value={kes(account?.cash || 0)} />
            <InfoRow label="Holdings Current Value" value={kes(current)} />
            <InfoRow label="Invested Value" value={kes(invested)} />
            <InfoRow label="Unrealized P&L" value={kes(pnl)} tone={pnl >= 0 ? "green" : "red"} />
            <InfoRow label="Total Equity" value={kes(totalEquity)} />
          </View>

          <View style={styles.card}>
            <Text style={styles.section}>Holdings</Text>

            {holdings.length === 0 ? (
              <Text style={styles.empty}>No holdings yet.</Text>
            ) : (
              holdings.map(h => {
                const pnl = Number(h.marketValue || 0) - Number(h.investedValue || 0);
                return (
                  <View key={h.symbol} style={styles.holding}>
                    <View>
                      <Text style={styles.symbol}>{h.symbol}</Text>
                      <Text style={styles.meta}>{h.name || h.sector || "NSE Security"}</Text>
                      <Text style={styles.meta}>Qty {Number(h.qty || 0).toLocaleString("en-KE")} · Avg {kes(h.avgPrice)}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.value}>{kes(h.marketValue)}</Text>
                      <Text style={[styles.pnl, { color: pnl >= 0 ? P.color.green : P.color.red }]}>
                        {pnl >= 0 ? "▲" : "▼"} {kes(pnl)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <CTA onPress={onClose}>Close</CTA>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: P.color.bg, paddingTop: 28, paddingBottom: 24 },
  title: { color: P.color.text, fontSize: 26, fontWeight: "900", marginHorizontal: P.spacing.screen },
  subtitle: { color: P.color.muted, marginHorizontal: P.spacing.screen, marginTop: 4, marginBottom: 14 },
  card: { backgroundColor: P.color.surface, borderRadius: P.radius.lg, borderWidth: 1, borderColor: P.color.border, padding: 16, marginHorizontal: P.spacing.screen, marginBottom: 12 },
  section: { color: P.color.text, fontSize: 18, fontWeight: "900", marginBottom: 8 },
  empty: { color: P.color.muted, lineHeight: 20 },
  holding: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: P.color.border, paddingVertical: 12 },
  symbol: { color: P.color.text, fontWeight: "900", fontSize: 16 },
  meta: { color: P.color.muted, fontSize: 11, marginTop: 3 },
  value: { color: P.color.text, fontWeight: "900" },
  pnl: { fontWeight: "900", fontSize: 11, marginTop: 4 }
});
