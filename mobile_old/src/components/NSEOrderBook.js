import { View, Text, Pressable, StyleSheet } from "react-native";
import { P } from "../theme/proTheme";
import { kes } from "../utils/money";

function makeDepth(price = 15) {
  const p = Number(price || 15);
  return {
    bids: [
      { split: 10, qty: 8262, price: +(p - 0.10).toFixed(2) },
      { split: 20, qty: 37969, price: +(p - 0.15).toFixed(2) },
      { split: 6, qty: 109210, price: +(p - 0.20).toFixed(2) },
      { split: 70, qty: 128736, price: +(p - 0.25).toFixed(2) },
      { split: 5, qty: 9030, price: +(p - 0.35).toFixed(2) }
    ],
    asks: [
      { price: +(p + 0.00).toFixed(2), qty: 60989, split: 1 },
      { price: +(p + 0.05).toFixed(2), qty: 32364, split: 7 },
      { price: +(p + 0.10).toFixed(2), qty: 2801, split: 1 },
      { price: +(p + 0.15).toFixed(2), qty: 55635, split: 6 },
      { price: +(p + 0.20).toFixed(2), qty: 50000, split: 2 }
    ]
  };
}

export default function NSEOrderBook({ symbol, name, market, onPickBuy, onPickSell }) {
  const last = Number(market?.price || market?.lastPrice || 15);
  const depth = market?.depth || makeDepth(last);
  const bids = depth.bids || [];
  const asks = depth.asks || [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{symbol} - {name || "NSE Security"}</Text>
        <View style={styles.actions}>
          <Text style={styles.buyBadge}>B</Text>
          <Text style={styles.sellBadge}>S</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.hCell}>Split</Text>
        <Text style={styles.hCell}>Bid Qty</Text>
        <Text style={styles.hCell}>Bid Price</Text>
        <Text style={styles.hCell}>Offer Price</Text>
        <Text style={styles.hCell}>Offer Qty</Text>
        <Text style={styles.hCell}>Split</Text>
      </View>

      {Array.from({ length: Math.max(bids.length, asks.length) }).map((_, i) => {
        const bid = bids[i];
        const ask = asks[i];

        return (
          <View key={i} style={styles.row}>
            <Pressable
              style={styles.bidSide}
              onPress={() => bid && onPickSell?.({ price: bid.price, qty: bid.qty })}
            >
              <Text style={styles.cell}>{bid?.split ?? ""}</Text>
              <Text style={styles.cell}>{bid?.qty?.toLocaleString("en-KE") ?? ""}</Text>
              <Text style={styles.bidPrice}>{bid?.price?.toFixed(2) ?? ""}</Text>
            </Pressable>

            <Pressable
              style={[styles.askSide, i === 0 && styles.bestAsk]}
              onPress={() => ask && onPickBuy?.({ price: ask.price, qty: ask.qty })}
            >
              <Text style={styles.askPrice}>{ask?.price?.toFixed(2) ?? ""}</Text>
              <Text style={styles.cellDark}>{ask?.qty?.toLocaleString("en-KE") ?? ""}</Text>
              <Text style={styles.cellDark}>{ask?.split ?? ""}</Text>
            </Pressable>
          </View>
        );
      })}

      <View style={styles.stats}>
        <Info label="Open" value={kes(market?.open || last)} />
        <Info label="High" value={kes(market?.high || last)} />
        <Info label="Change" value={`${Number(market?.changePct || 0).toFixed(2)}%`} />
        <Info label="Close" value={kes(market?.prevClose || last)} />
        <Info label="Low" value={kes(market?.low || last)} />
        <Info label="LTT" value={new Date().toLocaleTimeString()} />
      </View>

      <Text style={styles.help}>
        Tap red offer row to autofill BUY. Tap blue bid row to autofill SELL.
      </Text>
    </View>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: P.color.surface,
    borderRadius: P.radius.lg,
    borderWidth: 1,
    borderColor: P.color.border,
    marginHorizontal: P.spacing.screen,
    marginBottom: P.spacing.gap,
    overflow: "hidden"
  },
  header: {
    backgroundColor: "#0B1B4D",
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: { color: P.color.text, fontWeight: "900", flex: 1 },
  actions: { flexDirection: "row", gap: 5 },
  buyBadge: { color: "#fff", backgroundColor: "#003CFF", fontWeight: "900", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, overflow: "hidden" },
  sellBadge: { color: "#fff", backgroundColor: "#E11D48", fontWeight: "900", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4, overflow: "hidden" },
  tableHeader: { flexDirection: "row", backgroundColor: "#E5E7EB" },
  hCell: { flex: 1, color: "#0F172A", fontSize: 10, fontWeight: "900", textAlign: "center", paddingVertical: 5 },
  row: { flexDirection: "row", minHeight: 34 },
  bidSide: { flex: 1, flexDirection: "row", backgroundColor: "#BFDBFE", alignItems: "center" },
  askSide: { flex: 1, flexDirection: "row", backgroundColor: "#FCA5A5", alignItems: "center" },
  bestAsk: { backgroundColor: "#F87171" },
  cell: { flex: 1, color: "#0F172A", fontSize: 10, textAlign: "center", fontWeight: "700" },
  cellDark: { flex: 1, color: "#111827", fontSize: 10, textAlign: "center", fontWeight: "700" },
  bidPrice: { flex: 1, color: "#0F172A", fontSize: 10, textAlign: "center", fontWeight: "900" },
  askPrice: { flex: 1, color: "#111827", fontSize: 10, textAlign: "center", fontWeight: "900" },
  stats: { flexDirection: "row", flexWrap: "wrap", padding: 10, backgroundColor: P.color.bg },
  info: { width: "33%", paddingVertical: 4 },
  infoLabel: { color: P.color.muted, fontSize: 10 },
  infoValue: { color: P.color.text, fontWeight: "800", fontSize: 11, marginTop: 2 },
  help: { color: P.color.muted, fontSize: 11, paddingHorizontal: 10, paddingBottom: 10 }
});
