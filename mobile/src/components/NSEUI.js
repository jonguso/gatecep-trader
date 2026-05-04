import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { TOKENS } from "../theme/tokens";

export function Card({ title, caption, children, style }) {
  return (
    <View style={[s.card, style]}>
      {!!caption && <Text style={s.micro}>{caption}</Text>}
      {!!title && <Text style={s.h2}>{title}</Text>}
      {children}
    </View>
  );
}

export function PrimaryButton({ children, onPress, tone = "brand", disabled }) {
  const toneStyle =
    tone === "buy" ? s.buyButton :
    tone === "sell" ? s.sellButton :
    tone === "ghost" ? s.ghostButton :
    s.brandButton;

  const textStyle = tone === "ghost" ? s.ghostButtonText : s.buttonText;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [s.button, toneStyle, disabled && s.disabled, pressed && s.pressed]}
      accessibilityRole="button"
    >
      <Text style={textStyle}>{children}</Text>
    </Pressable>
  );
}

export function Chip({ label, active, tone = "brand", onPress }) {
  const activeStyle =
    tone === "up" ? s.chipUp :
    tone === "down" ? s.chipDown :
    s.chipActive;

  return (
    <Pressable onPress={onPress} style={[s.chip, active && activeStyle]}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Metric({ label, value, tone = "neutral" }) {
  const color =
    tone === "up" ? TOKENS.color.up :
    tone === "down" ? TOKENS.color.down :
    tone === "brand" ? TOKENS.color.brandLight :
    TOKENS.color.text;

  return (
    <View style={s.metric}>
      <Text style={s.metricLabel}>{label}</Text>
      <Text style={[s.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

export function StockRow({ symbol, name, price, change, onPress }) {
  const up = String(change || "").startsWith("+") || String(change || "").includes("▲");
  return (
    <Pressable onPress={onPress} style={s.stockRow}>
      <View style={[s.logo, { backgroundColor: up ? TOKENS.color.upBg : TOKENS.color.downBg }]}>
        <Text style={s.logoText}>{symbol?.slice(0, 2)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.stockSymbol}>{symbol}</Text>
        <Text style={s.stockName} numberOfLines={1}>{name}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={s.stockPrice}>{price}</Text>
        <Text style={[s.change, { color: up ? TOKENS.color.up : TOKENS.color.down }]}>
          {up ? "▲ " : "▼ "}{change}
        </Text>
      </View>
    </Pressable>
  );
}

export function LoadingCard({ label = "Loading..." }) {
  return (
    <Card>
      <ActivityIndicator color={TOKENS.color.brand} />
      <Text style={[s.subtitle, { textAlign: "center", marginTop: 8 }]}>{label}</Text>
    </Card>
  );
}

export function RiskDisclaimer() {
  return (
    <View style={s.disclaimer}>
      <Text style={s.disclaimerText}>
        Coach G provides AI-assisted market analysis only. It does not guarantee returns.
        Confirm all trades through your selected licensed broker.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1,
    borderColor: TOKENS.color.border,
    padding: TOKENS.spacing.card,
    marginBottom: TOKENS.spacing.lg
  },
  h2: { ...TOKENS.type.h2, color: TOKENS.color.text, marginBottom: 8 },
  subtitle: { ...TOKENS.type.caption, color: TOKENS.color.textSecondary },
  micro: { ...TOKENS.type.micro, color: TOKENS.color.textSecondary, textTransform: "uppercase", marginBottom: 6 },
  button: {
    minHeight: TOKENS.layout.ctaHeight,
    borderRadius: TOKENS.radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    marginTop: 10
  },
  brandButton: { backgroundColor: TOKENS.color.brand },
  buyButton: { backgroundColor: TOKENS.color.upCta },
  sellButton: { backgroundColor: TOKENS.color.downCta },
  ghostButton: { backgroundColor: TOKENS.color.brandTint, borderWidth: 1, borderColor: TOKENS.color.brandBorder },
  buttonText: { ...TOKENS.type.button, color: TOKENS.color.white },
  ghostButtonText: { ...TOKENS.type.button, color: TOKENS.color.brandLight },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  chip: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: TOKENS.radius.pill,
    borderWidth: 1,
    borderColor: TOKENS.color.border,
    backgroundColor: TOKENS.color.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 8
  },
  chipActive: { backgroundColor: TOKENS.color.brandTint, borderColor: TOKENS.color.brandBorder },
  chipUp: { backgroundColor: TOKENS.color.upBg, borderColor: TOKENS.color.up },
  chipDown: { backgroundColor: TOKENS.color.downBg, borderColor: TOKENS.color.down },
  chipText: { fontSize: 12, fontWeight: "600", color: TOKENS.color.textSecondary },
  chipTextActive: { color: TOKENS.color.text },
  metric: {
    width: "48%",
    backgroundColor: TOKENS.color.surface,
    borderRadius: TOKENS.radius.lg,
    borderWidth: 1,
    borderColor: TOKENS.color.border,
    padding: TOKENS.spacing.card,
    marginBottom: TOKENS.spacing.sm
  },
  metricLabel: { ...TOKENS.type.caption, color: TOKENS.color.textSecondary },
  metricValue: { ...TOKENS.type.h2, marginTop: 4 },
  stockRow: {
    minHeight: TOKENS.layout.listItemHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.color.border,
    paddingVertical: 10
  },
  logo: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  logoText: { color: TOKENS.color.text, fontWeight: "800", fontSize: 12 },
  stockSymbol: { color: TOKENS.color.text, fontWeight: "800", fontSize: 13 },
  stockName: { color: TOKENS.color.textSecondary, fontSize: 11, marginTop: 2 },
  stockPrice: { color: TOKENS.color.text, fontWeight: "800" },
  change: { fontSize: 11, marginTop: 3, fontWeight: "700" },
  disclaimer: {
    backgroundColor: TOKENS.color.infoBg,
    borderRadius: TOKENS.radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: TOKENS.color.brandBorder,
    marginBottom: 14
  },
  disclaimerText: { color: TOKENS.color.text, fontSize: 11, lineHeight: 17 }
});
