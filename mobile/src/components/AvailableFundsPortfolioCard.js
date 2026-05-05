import { View, Text, StyleSheet } from "react-native";
import { P } from "../theme/proTheme";

export default function AvailableFundsPortfolioCard({
  availableFunds,
  investedValue,
  currentValue,
  pnl,
  pnlPct,
  formatMoney,
  formatPct
}) {
  const isUp = Number(pnl || 0) >= 0;

  return (
    <View style={styles.card}>
      <Text style={styles.overline}>AVAILABLE FUNDS</Text>
      <Text style={styles.bigValue}>{formatMoney(availableFunds)}</Text>

      <View style={[styles.pnlBadge, { backgroundColor: isUp ? P.color.greenSoft : P.color.redSoft }]}>
        <Text style={[styles.pnlText, { color: isUp ? P.color.green : P.color.red }]}>
          {isUp ? "▲" : "▼"} {formatMoney(pnl)} ({formatPct(pnlPct)})
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Invested Value</Text>
          <Text style={styles.value}>{formatMoney(investedValue)}</Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.label}>Current Value</Text>
          <Text style={styles.value}>{formatMoney(currentValue)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: P.color.card,
    borderRadius: P.radius.xl,
    borderWidth: 1,
    borderColor: P.color.border,
    padding: 18,
    marginHorizontal: P.spacing.screen,
    marginBottom: 14
  },
  overline: {
    color: P.color.muted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8
  },
  bigValue: {
    color: P.color.text,
    fontSize: 32,
    fontWeight: "900",
    marginTop: 8
  },
  pnlBadge: {
    alignSelf: "flex-start",
    borderRadius: P.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12
  },
  pnlText: {
    fontWeight: "900",
    fontSize: 13
  },
  divider: {
    height: 1,
    backgroundColor: P.color.border,
    marginVertical: 16
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  label: {
    color: P.color.muted,
    fontSize: 12
  },
  value: {
    color: P.color.text,
    fontWeight: "900",
    marginTop: 5
  }
});
