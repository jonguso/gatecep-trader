import { View, Text, Pressable, StyleSheet } from "react-native";
import { P } from "../theme/proTheme";
import { kes } from "../utils/money";

export default function PortfolioHoldingRow({ holding, onPress }) {
  const qty = Number(holding.qty || 0);
  const price = Number(holding.marketPrice || holding.price || holding.avgPrice || 0);
  const avgPrice = Number(holding.avgPrice || price || 0);
  const value = qty * price;
  const cost = qty * avgPrice;
  const pnl = value - cost;
  const up = pnl >= 0;

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.badge, { backgroundColor: up ? P.color.greenSoft : P.color.redSoft }]}>
        <Text style={styles.badgeText}>{holding.symbol?.slice(0, 2)}</Text>
      </View>

      <View style={styles.main}>
        <View style={styles.topLine}>
          <Text style={styles.symbol}>{holding.symbol}</Text>
          <Text style={styles.value}>{kes(value)}</Text>
        </View>

        <View style={styles.midLine}>
          <Text style={styles.meta}>Qty {qty.toLocaleString("en-KE")}</Text>
          <Text style={styles.meta}>Price {kes(price)}</Text>
        </View>

        <View style={styles.bottomLine}>
          <Text style={styles.meta}>Avg {kes(avgPrice)}</Text>
          <Text style={[styles.pnl, { color: up ? P.color.green : P.color.red }]}>
            {up ? "▲" : "▼"} {kes(pnl)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: P.color.border,
    paddingVertical: 12
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  badgeText: {
    color: P.color.text,
    fontWeight: "900"
  },
  main: {
    flex: 1
  },
  topLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  midLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5
  },
  bottomLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5
  },
  symbol: {
    color: P.color.text,
    fontSize: 15,
    fontWeight: "900"
  },
  value: {
    color: P.color.text,
    fontSize: 14,
    fontWeight: "900"
  },
  meta: {
    color: P.color.muted,
    fontSize: 11
  },
  pnl: {
    fontSize: 11,
    fontWeight: "900"
  }
});
