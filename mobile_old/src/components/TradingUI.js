import { useEffect, useRef } from "react";
import { Animated, View, Text, Pressable, StyleSheet } from "react-native";
import { T } from "../theme/tradingTheme";

export function Page({ children }) {
  return <View style={s.page}>{children}</View>;
}

export function Header({ title, subtitle, right }) {
  return (
    <View style={s.header}>
      <View>
        <Text style={s.title}>{title}</Text>
        {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function PortfolioHero({ invested, current, pnl, pnlPct }) {
  const anim = useRef(new Animated.Value(0.96)).current;
  const isUp = !String(pnl).includes("-");

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[s.hero, { transform: [{ scale: anim }] }]}>
      <Text style={s.heroLabel}>TOTAL PORTFOLIO VALUE</Text>
      <Text style={s.heroValue}>{current}</Text>
      <View style={[s.pnlPill, { backgroundColor: isUp ? T.color.greenSoft : T.color.redSoft }]}>
        <Text style={[s.pnlText, { color: isUp ? T.color.green : T.color.red }]}>
          {isUp ? "▲" : "▼"} {pnl} ({pnlPct})
        </Text>
      </View>
      <View style={s.heroDivider} />
      <View style={s.heroRow}>
        <View>
          <Text style={s.smallLabel}>Invested Value</Text>
          <Text style={s.smallValue}>{invested}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={s.smallLabel}>Status</Text>
          <Text style={s.smallValue}>Broker synced</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export function SegmentTabs({ tabs, active, onChange }) {
  return (
    <View style={s.segmentWrap}>
      {tabs.map(tab => {
        const selected = tab === active;
        return (
          <Pressable key={tab} onPress={() => onChange(tab)} style={[s.segment, selected && s.segmentActive]}>
            <Text style={[s.segmentText, selected && s.segmentTextActive]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function MarketRow({ symbol, name, price, change, onPress }) {
  const up = !String(change).startsWith("-");
  return (
    <Pressable onPress={onPress} style={s.marketRow}>
      <View style={[s.symbolBadge, { backgroundColor: up ? T.color.greenSoft : T.color.redSoft }]}>
        <Text style={s.symbolBadgeText}>{symbol?.slice(0, 2)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.symbol}>{symbol}</Text>
        <Text style={s.name} numberOfLines={1}>{name}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={s.price}>{price}</Text>
        <Text style={[s.change, { color: up ? T.color.green : T.color.red }]}>{up ? "▲ " : "▼ "}{change}</Text>
      </View>
    </Pressable>
  );
}

export function ChartPreview({ symbol }) {
  const bars = [28, 45, 33, 55, 48, 72, 60, 82, 70, 88, 76, 96];
  return (
    <Card>
      <View style={s.chartHead}>
        <View>
          <Text style={s.chartTitle}>{symbol} Live Preview</Text>
          <Text style={s.chartSub}>Demo/delayed feed · broker-aware</Text>
        </View>
        <Text style={s.liveDot}>● LIVE</Text>
      </View>
      <View style={s.chartArea}>
        {bars.map((h, i) => (
          <View key={i} style={[s.chartBar, { height: h, backgroundColor: i % 3 === 0 ? T.color.red : T.color.green }]} />
        ))}
      </View>
    </Card>
  );
}

export function CTA({ children, onPress, tone = "blue" }) {
  const bg = tone === "buy" ? T.color.green : tone === "sell" ? T.color.red : T.color.blue;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.cta, { backgroundColor: bg }, pressed && { opacity: 0.85 }]}>
      <Text style={s.ctaText}>{children}</Text>
    </Pressable>
  );
}

export function InfoRow({ label, value, valueTone }) {
  const color = valueTone === "red" ? T.color.red : valueTone === "green" ? T.color.green : T.color.text;
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, { color }]}>{value}</Text>
    </View>
  );
}

export function Disclaimer() {
  return (
    <View style={s.disclaimer}>
      <Text style={s.disclaimerText}>
        Coach G provides AI-assisted decision support only. Trades are confirmed through your selected licensed broker.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: T.color.bg },
  header: { paddingHorizontal: T.spacing.screen, paddingTop: 18, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: T.color.text, fontSize: 24, fontWeight: "900", letterSpacing: -0.4 },
  subtitle: { color: T.color.muted, marginTop: 3, fontSize: 12 },
  card: { backgroundColor: T.color.surface, borderRadius: T.radius.lg, borderWidth: 1, borderColor: T.color.border, padding: T.spacing.card, marginHorizontal: T.spacing.screen, marginBottom: T.spacing.gap },
  hero: { backgroundColor: T.color.card, borderRadius: T.radius.xl, borderWidth: 1, borderColor: T.color.border, padding: 18, marginHorizontal: T.spacing.screen, marginBottom: 14 },
  heroLabel: { color: T.color.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  heroValue: { color: T.color.text, fontSize: 31, fontWeight: "900", marginTop: 6, letterSpacing: -0.8 },
  pnlPill: { alignSelf: "flex-start", borderRadius: T.radius.pill, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10 },
  pnlText: { fontWeight: "900", fontSize: 13 },
  heroDivider: { height: 1, backgroundColor: T.color.border, marginVertical: 16 },
  heroRow: { flexDirection: "row", justifyContent: "space-between" },
  smallLabel: { color: T.color.muted, fontSize: 11 },
  smallValue: { color: T.color.text, fontWeight: "800", marginTop: 4 },
  segmentWrap: { flexDirection: "row", backgroundColor: T.color.surface, marginHorizontal: T.spacing.screen, borderRadius: T.radius.md, borderWidth: 1, borderColor: T.color.border, padding: 4, marginBottom: 12 },
  segment: { flex: 1, minHeight: 42, alignItems: "center", justifyContent: "center", borderRadius: T.radius.sm },
  segmentActive: { backgroundColor: T.color.blue },
  segmentText: { color: T.color.muted, fontWeight: "800", fontSize: 12 },
  segmentTextActive: { color: T.color.white },
  marketRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: T.color.border, paddingVertical: 10 },
  symbolBadge: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  symbolBadgeText: { color: T.color.text, fontWeight: "900" },
  symbol: { color: T.color.text, fontWeight: "900", fontSize: 14 },
  name: { color: T.color.muted, fontSize: 12, marginTop: 2 },
  price: { color: T.color.text, fontWeight: "900" },
  change: { fontSize: 12, fontWeight: "900", marginTop: 3 },
  chartHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  chartTitle: { color: T.color.text, fontWeight: "900", fontSize: 16 },
  chartSub: { color: T.color.muted, fontSize: 11, marginTop: 3 },
  liveDot: { color: T.color.green, fontSize: 11, fontWeight: "900" },
  chartArea: { height: 120, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 18 },
  chartBar: { width: 14, borderRadius: 6, opacity: 0.9 },
  cta: { minHeight: 50, borderRadius: T.radius.md, alignItems: "center", justifyContent: "center", marginHorizontal: T.spacing.screen, marginBottom: 12 },
  ctaText: { color: T.color.white, fontWeight: "900", fontSize: 15 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: T.color.border },
  infoLabel: { color: T.color.muted },
  infoValue: { fontWeight: "900" },
  disclaimer: { backgroundColor: T.color.blueSoft, borderWidth: 1, borderColor: T.color.border, borderRadius: T.radius.lg, padding: 12, marginHorizontal: T.spacing.screen, marginBottom: 24 },
  disclaimerText: { color: T.color.text, fontSize: 11, lineHeight: 17 }
});
