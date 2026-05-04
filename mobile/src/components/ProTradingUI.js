import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, Text, TextInput, View, StyleSheet } from "react-native";
import { P } from "../theme/proTheme";

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

export function CTA({ children, onPress, tone = "blue" }) {
  const bg = tone === "buy" ? P.color.green : tone === "sell" ? P.color.red : tone === "ghost" ? P.color.blueSoft : P.color.blue;
  const border = tone === "ghost" ? P.color.blue : bg;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.cta, { backgroundColor: bg, borderColor: border }, pressed && { opacity: 0.82 }]}>
      <Text style={[s.ctaText, tone === "ghost" && { color: P.color.blue }]}>{children}</Text>
    </Pressable>
  );
}

export function Segments({ tabs, active, onChange }) {
  return (
    <View style={s.segments}>
      {tabs.map(t => (
        <Pressable key={t} onPress={() => onChange(t)} style={[s.segment, active === t && s.segmentActive]}>
          <Text style={[s.segmentText, active === t && s.segmentTextActive]}>{t}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function AnimatedPnLCard({ invested, current, pnl, pnlPct }) {
  const anim = useRef(new Animated.Value(0.94)).current;
  const isUp = !String(pnl).includes("-");

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[s.pnlCard, { transform: [{ scale: anim }] }]}>
      <Text style={s.overline}>TOTAL PORTFOLIO</Text>
      <Text style={s.bigValue}>{current}</Text>
      <View style={[s.pnlBadge, { backgroundColor: isUp ? P.color.greenSoft : P.color.redSoft }]}>
        <Text style={[s.pnlText, { color: isUp ? P.color.green : P.color.red }]}>{isUp ? "▲" : "▼"} {pnl} ({pnlPct})</Text>
      </View>
      <View style={s.divider} />
      <View style={s.rowBetween}>
        <View>
          <Text style={s.label}>Invested Value</Text>
          <Text style={s.value}>{invested}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={s.label}>Current Value</Text>
          <Text style={s.value}>{current}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export function StockRow({ item, price, change, onPress, onLongPress }) {
  const up = Number(change) >= 0;
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={s.stockRow}>
      <View style={[s.badge, { backgroundColor: up ? P.color.greenSoft : P.color.redSoft }]}>
        <Text style={s.badgeText}>{item.symbol?.slice(0, 2)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.symbol}>{item.symbol}</Text>
        <Text style={s.name} numberOfLines={1}>{item.name || item.sector || "NSE Security"}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={s.price}>{price}</Text>
        <Text style={[s.change, { color: up ? P.color.green : P.color.red }]}>{up ? "▲" : "▼"} {change > 0 ? "+" : ""}{Number(change).toFixed(2)}%</Text>
      </View>
    </Pressable>
  );
}

export function ActivityRow({ item }) {
  const isBuy = item.side === "BUY";
  return (
    <View style={s.activityRow}>
      <View style={[s.activityIcon, { backgroundColor: isBuy ? P.color.greenSoft : P.color.redSoft }]}>
        <Text style={{ color: isBuy ? P.color.green : P.color.red, fontWeight: "900" }}>{isBuy ? "B" : "S"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.activityTitle}>{item.side} {item.symbol}</Text>
        <Text style={s.activityMeta}>{item.status || "ROUTED"} · {item.brokerId || "broker"}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={s.activityValue}>{item.qty || item.originalQty || 0} @ {item.price}</Text>
        <Text style={s.activityMeta}>{item.submittedAt ? String(item.submittedAt).slice(0, 10) : "Today"}</Text>
      </View>
    </View>
  );
}

export function Field({ label, value, onChangeText, keyboardType = "default" }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} style={s.input} />
    </View>
  );
}

export function InfoRow({ label, value, tone }) {
  const color = tone === "green" ? P.color.green : tone === "red" ? P.color.red : P.color.text;
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={[s.infoValue, { color }]}>{value}</Text>
    </View>
  );
}

export function ActionSheet({ visible, stock, onClose, onBuy, onSell, onCoach }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>{stock?.symbol || "Stock"}</Text>
          <Text style={s.sheetSub}>{stock?.name || "Choose an action"}</Text>

          <CTA tone="ghost" onPress={onCoach}>Ask Coach G First</CTA>
          <CTA tone="buy" onPress={onBuy}>Buy</CTA>
          <CTA tone="sell" onPress={onSell}>Sell</CTA>
          <CTA tone="ghost" onPress={onClose}>Cancel</CTA>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function CoachPrompt({ visible, stock, onClose, onBuy, onSell }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.backdrop}>
        <View style={s.prompt}>
          <Text style={s.promptTitle}>Coach G</Text>
          <Text style={s.promptText}>
            Before you trade {stock?.symbol}, Coach G recommends reviewing liquidity, fees, broker status, and portfolio exposure.
          </Text>
          <InfoRow label="Suggested action" value="HOLD / REVIEW" tone="green" />
          <CTA tone="buy" onPress={onBuy}>Continue to Buy</CTA>
          <CTA tone="sell" onPress={onSell}>Continue to Sell</CTA>
          <CTA tone="ghost" onPress={onClose}>Not Now</CTA>
        </View>
      </View>
    </Modal>
  );
}

export function Disclaimer() {
  return (
    <View style={s.disclaimer}>
      <Text style={s.disclaimerText}>AI-assisted decision support only. Confirm all trades through your selected licensed broker.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: P.color.bg },
  header: { paddingHorizontal: P.spacing.screen, paddingTop: 18, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: P.color.text, fontSize: 24, fontWeight: "900" },
  subtitle: { color: P.color.muted, marginTop: 3, fontSize: 12 },
  card: { backgroundColor: P.color.surface, borderRadius: P.radius.lg, borderWidth: 1, borderColor: P.color.border, padding: P.spacing.card, marginHorizontal: P.spacing.screen, marginBottom: P.spacing.gap },
  cta: { minHeight: 50, borderRadius: P.radius.md, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 10 },
  ctaText: { color: P.color.white, fontWeight: "900", fontSize: 15 },
  segments: { flexDirection: "row", marginHorizontal: P.spacing.screen, marginBottom: 12, padding: 4, backgroundColor: P.color.surface, borderRadius: P.radius.md, borderWidth: 1, borderColor: P.color.border },
  segment: { flex: 1, minHeight: 40, alignItems: "center", justifyContent: "center", borderRadius: P.radius.sm },
  segmentActive: { backgroundColor: P.color.blue },
  segmentText: { color: P.color.muted, fontWeight: "800", fontSize: 12 },
  segmentTextActive: { color: P.color.white },
  pnlCard: { backgroundColor: P.color.card, borderRadius: P.radius.xl, borderWidth: 1, borderColor: P.color.border, padding: 18, marginHorizontal: P.spacing.screen, marginBottom: 14 },
  overline: { color: P.color.muted, fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  bigValue: { color: P.color.text, fontSize: 32, fontWeight: "900", marginTop: 6 },
  pnlBadge: { alignSelf: "flex-start", borderRadius: P.radius.pill, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10 },
  pnlText: { fontWeight: "900", fontSize: 13 },
  divider: { height: 1, backgroundColor: P.color.border, marginVertical: 16 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: P.color.muted, fontSize: 12, marginBottom: 4 },
  value: { color: P.color.text, fontWeight: "800", marginTop: 4 },
  stockRow: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: P.color.border, paddingVertical: 10 },
  badge: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  badgeText: { color: P.color.text, fontWeight: "900" },
  symbol: { color: P.color.text, fontWeight: "900", fontSize: 14 },
  name: { color: P.color.muted, fontSize: 12, marginTop: 2 },
  price: { color: P.color.text, fontWeight: "900" },
  change: { fontSize: 12, fontWeight: "900", marginTop: 3 },
  activityRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: P.color.border, paddingVertical: 10 },
  activityIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  activityTitle: { color: P.color.text, fontWeight: "900" },
  activityMeta: { color: P.color.muted, fontSize: 11, marginTop: 2 },
  activityValue: { color: P.color.text, fontWeight: "800" },
  input: { backgroundColor: P.color.bg, borderWidth: 1, borderColor: P.color.border, borderRadius: P.radius.md, minHeight: 46, color: P.color.text, paddingHorizontal: 12, fontWeight: "800" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: P.color.border },
  infoLabel: { color: P.color.muted },
  infoValue: { fontWeight: "900" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheet: { backgroundColor: P.color.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 18, borderTopWidth: 1, borderColor: P.color.border },
  sheetHandle: { alignSelf: "center", width: 44, height: 4, borderRadius: 4, backgroundColor: P.color.border, marginBottom: 14 },
  sheetTitle: { color: P.color.text, fontSize: 24, fontWeight: "900" },
  sheetSub: { color: P.color.muted, marginTop: 4, marginBottom: 8 },
  prompt: { backgroundColor: P.color.surface, margin: 20, borderRadius: 22, borderWidth: 1, borderColor: P.color.border, padding: 18, alignSelf: "stretch" },
  promptTitle: { color: P.color.blue, fontSize: 26, fontWeight: "900" },
  promptText: { color: P.color.text, lineHeight: 20, marginVertical: 12 },
  disclaimer: { marginHorizontal: P.spacing.screen, marginBottom: 24, borderRadius: P.radius.lg, backgroundColor: P.color.blueSoft, borderWidth: 1, borderColor: P.color.border, padding: 12 },
  disclaimerText: { color: P.color.text, fontSize: 11, lineHeight: 17 }
});
