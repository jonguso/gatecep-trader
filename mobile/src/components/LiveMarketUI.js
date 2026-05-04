import { useEffect, useRef } from "react";
import { Animated, View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { P } from "../theme/proTheme";
import { kes } from "../utils/money";
import { compactNumber, kesCompact } from "../utils/marketFormat";

export function Sparkline({ data = [], up = true, width = 76, height = 30 }) {
  const values = data.length ? data : [10, 12, 11, 15, 14, 18, 16, 20];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={up ? P.color.green : P.color.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PriceFlash({ price, previous }) {
  const flash = useRef(new Animated.Value(0)).current;
  const direction = previous == null ? 0 : Number(price) > Number(previous) ? 1 : Number(price) < Number(previous) ? -1 : 0;

  useEffect(() => {
    if (!direction) return;
    flash.setValue(1);
    Animated.timing(flash, { toValue: 0, duration: 900, useNativeDriver: false }).start();
  }, [price]);

  const bg = flash.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", direction > 0 ? P.color.greenSoft : P.color.redSoft]
  });

  return (
    <Animated.View style={[styles.flashBox, { backgroundColor: bg }]}>
      <Text style={[styles.price, { color: direction > 0 ? P.color.green : direction < 0 ? P.color.red : P.color.text }]}>
        {kes(price)}
      </Text>
    </Animated.View>
  );
}

export function HotBadge({ item }) {
  if (!item?.isHot) return null;
  return (
    <View style={styles.hotBadge}>
      <Text style={styles.hotText}>🔥 HOT</Text>
    </View>
  );
}

export function LiveStockRow({ item, previousPrice, change, sparkData, onPress, onLongPress }) {
  const price = Number(item.price || item.marketPrice || item.lastPrice || 0);
  const up = Number(change ?? item.changePct ?? 0) >= 0;
  const volume = item.volume || item.tradedVolume || 0;
  const turnover = item.turnover || price * volume;

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.row}>
      <View style={[styles.badge, { backgroundColor: up ? P.color.greenSoft : P.color.redSoft }]}>
        <Text style={styles.badgeText}>{item.symbol?.slice(0, 2)}</Text>
      </View>

      <View style={styles.nameBlock}>
        <View style={styles.symbolLine}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <HotBadge item={item} />
        </View>
        <Text style={styles.name} numberOfLines={1}>{item.name || item.sector || "NSE Security"}</Text>
        <Text style={styles.marketMeta}>
          Vol {compactNumber(volume)} · Turnover {kesCompact(turnover)}
        </Text>
      </View>

      <Sparkline data={sparkData} up={up} />

      <View style={styles.priceBlock}>
        <PriceFlash price={price} previous={previousPrice} />
        <Text style={[styles.change, { color: up ? P.color.green : P.color.red }]}>
          {up ? "▲" : "▼"} {Number(change ?? item.changePct ?? 0) > 0 ? "+" : ""}{Number(change ?? item.changePct ?? 0).toFixed(2)}%
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: P.color.border,
    paddingVertical: 10
  },
  badge: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  badgeText: { color: P.color.text, fontWeight: "900" },
  nameBlock: { flex: 1, minWidth: 110 },
  symbolLine: { flexDirection: "row", alignItems: "center", gap: 6 },
  symbol: { color: P.color.text, fontWeight: "900", fontSize: 14 },
  name: { color: P.color.muted, fontSize: 12, marginTop: 2 },
  marketMeta: { color: P.color.muted, fontSize: 10, marginTop: 4 },
  priceBlock: { alignItems: "flex-end", minWidth: 92 },
  flashBox: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  price: { fontWeight: "900", fontSize: 12 },
  change: { fontSize: 11, fontWeight: "900", marginTop: 3 },
  hotBadge: { backgroundColor: P.color.blueSoft, borderWidth: 1, borderColor: P.color.blue, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  hotText: { color: P.color.blue, fontSize: 9, fontWeight: "900" }
});
