import { useRef } from "react";
import { Animated, PanResponder, Pressable, Text, View, StyleSheet } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { P } from "../theme/proTheme";
import { kes } from "../utils/money";
import { compactNumber, kesCompact } from "../utils/marketFormat";

function Sparkline({ data = [], up = true, width = 74, height = 30 }) {
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
      <Polyline
        points={points}
        fill="none"
        stroke={up ? P.color.green : P.color.red}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HotBadge({ item }) {
  if (!item?.isHot) return null;
  return (
    <View style={styles.hotBadge}>
      <Text style={styles.hotText}>🔥 HOT</Text>
    </View>
  );
}

export default function GestureMarketRow({
  item,
  change,
  sparkData,
  onOpenChart,
  onOpenTrade,
  onBuy,
  onSell
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);
  const price = Number(item.price || item.marketPrice || item.lastPrice || 0);
  const up = Number(change ?? item.changePct ?? 0) >= 0;
  const volume = item.volume || item.tradedVolume || 0;
  const turnover = item.turnover || price * volume;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(Math.max(-96, Math.min(96, gesture.dx)));
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 70) {
          onBuy?.(item);
        } else if (gesture.dx < -70) {
          onSell?.(item);
        }

        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 7
        }).start();
      }
    })
  ).current;

  const handlePress = () => {
    const now = Date.now();

    if (now - lastTap.current < 320) {
      lastTap.current = 0;
      onOpenTrade?.(item);
      return;
    }

    lastTap.current = now;

    setTimeout(() => {
      if (Date.now() - lastTap.current >= 300) {
        onOpenChart?.(item);
      }
    }, 330);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.actionBg}>
        <Text style={styles.buyHint}>BUY</Text>
        <Text style={styles.sellHint}>SELL</Text>
      </View>

      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        <Pressable onPress={handlePress} style={styles.row}>
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
            <Text style={styles.price}>{kes(price)}</Text>
            <Text style={[styles.change, { color: up ? P.color.green : P.color.red }]}>
              {up ? "▲" : "▼"} {Number(change ?? item.changePct ?? 0) > 0 ? "+" : ""}{Number(change ?? item.changePct ?? 0).toFixed(2)}%
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: P.color.border
  },
  actionBg: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    backgroundColor: P.color.surface
  },
  buyHint: {
    color: P.color.green,
    fontWeight: "900"
  },
  sellHint: {
    color: P.color.red,
    fontWeight: "900"
  },
  row: {
    minHeight: 86,
    backgroundColor: P.color.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10
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
  nameBlock: {
    flex: 1,
    minWidth: 110
  },
  symbolLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  symbol: {
    color: P.color.text,
    fontWeight: "900",
    fontSize: 14
  },
  name: {
    color: P.color.muted,
    fontSize: 12,
    marginTop: 2
  },
  marketMeta: {
    color: P.color.muted,
    fontSize: 10,
    marginTop: 4
  },
  priceBlock: {
    alignItems: "flex-end",
    minWidth: 92
  },
  price: {
    color: P.color.text,
    fontWeight: "900",
    fontSize: 12
  },
  change: {
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3
  },
  hotBadge: {
    backgroundColor: P.color.blueSoft,
    borderWidth: 1,
    borderColor: P.color.blue,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  hotText: {
    color: P.color.blue,
    fontSize: 9,
    fontWeight: "900"
  }
});
