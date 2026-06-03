import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { P } from "../theme/proTheme";

function normalizePriceInput(value) {
  const clean = String(value || "")
    .replace(/[^0-9.]/g, "")
    .replace(/(\..*)\./g, "$1");

  const parts = clean.split(".");
  if (parts.length === 1) return parts[0];

  return `${parts[0]}.${parts[1].slice(0, 2)}`;
}

function normalizeQtyInput(value) {
  return String(value || "").replace(/[^0-9]/g, "");
}

export default function NSEOrderEntry({
  symbol,
  name,
  side,
  setSide,
  qty,
  setQty,
  price,
  setPrice,
  orderType,
  setOrderType,
  validity,
  setValidity,
  mode,
  setMode,
  priceBand,
  onOpenImpact,
  onOpenSecurity,
  onResetDefaults
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Order Entry</Text>
        <Pressable onPress={onResetDefaults}>
          <Text style={styles.reset}>RESET</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <FieldBox label="Instrument Type" value="Normal" />

          <Pressable style={styles.securityBox} onPress={onOpenSecurity}>
            <Text style={styles.label}>Security</Text>
            <View style={styles.securityLine}>
              <Text style={styles.security}>{symbol}</Text>
              <Text style={styles.chevron}>⌄</Text>
            </View>
            <Text style={styles.securityName} numberOfLines={1}>{name || "NSE Security"}</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              value={String(qty)}
              onChangeText={(v) => setQty(normalizeQtyInput(v))}
              keyboardType="numeric"
              style={styles.input}
            />
            <Text style={styles.small}>Defaults from best {side === "BUY" ? "offer" : "bid"} quantity</Text>
          </View>

          <FieldBox
            label="Order Type"
            value={orderType}
            onPress={() => setOrderType(orderType === "LIMIT" ? "MARKET" : "LIMIT")}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>Price (in KES)</Text>
            <TextInput
              value={String(price)}
              onChangeText={(v) => setPrice(normalizePriceInput(v))}
              keyboardType="decimal-pad"
              style={styles.input}
            />
            <Text style={styles.small}>
              {priceBand?.valid ? `${priceBand.minPrice.toFixed(2)} to ${priceBand.maxPrice.toFixed(2)}` : "No price band"}
            </Text>
          </View>

          <FieldBox
            label="Validity"
            value={validity}
            onPress={() => setValidity(validity === "DAY" ? "GTC" : "DAY")}
          />
        </View>

        <Text style={styles.label}>Trading Mode</Text>
        <View style={styles.modeRow}>
          <Pressable onPress={() => setMode("Delivery")} style={[styles.mode, mode === "Delivery" && styles.modeActive]}>
            <Text style={[styles.modeText, mode === "Delivery" && styles.modeTextActive]}>Delivery</Text>
          </Pressable>
          <Pressable onPress={() => setMode("Intraday")} style={[styles.mode, mode === "Intraday" && styles.modeActive]}>
            <Text style={[styles.modeText, mode === "Intraday" && styles.modeTextActive]}>Intraday</Text>
          </Pressable>
        </View>

        <View style={styles.buySellRow}>
          <Pressable
            onPress={() => {
              setSide("BUY");
              onOpenImpact?.("BUY");
            }}
            style={[styles.buyBtn, side === "BUY" && styles.active]}
          >
            <Text style={styles.btnText}>BUY</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setSide("SELL");
              onOpenImpact?.("SELL");
            }}
            style={[styles.sellBtn, side === "SELL" && styles.active]}
          >
            <Text style={styles.btnText}>SELL</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function FieldBox({ label, value, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.fieldBox}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.selectValue}>{value} ▾</Text>
    </Pressable>
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
    justifyContent: "space-between"
  },
  headerText: {
    color: P.color.text,
    fontWeight: "900"
  },
  reset: {
    color: "#052E16",
    backgroundColor: "#00FF40",
    fontWeight: "900",
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: "hidden"
  },
  body: {
    padding: 12
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12
  },
  fieldBox: {
    flex: 1,
    backgroundColor: P.color.bg,
    borderWidth: 1,
    borderColor: P.color.border,
    borderRadius: P.radius.md,
    padding: 10
  },
  securityBox: {
    flex: 1.45,
    backgroundColor: P.color.bg,
    borderWidth: 1,
    borderColor: P.color.border,
    borderRadius: P.radius.md,
    padding: 10
  },
  label: {
    color: P.color.muted,
    fontSize: 11,
    marginBottom: 5
  },
  selectValue: {
    color: P.color.text,
    fontWeight: "900"
  },
  securityLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  security: {
    color: P.color.text,
    fontSize: 18,
    fontWeight: "900"
  },
  chevron: {
    color: P.color.blue,
    fontSize: 18,
    fontWeight: "900"
  },
  securityName: {
    color: P.color.muted,
    fontSize: 10,
    marginTop: 3
  },
  inputBox: {
    flex: 1
  },
  input: {
    backgroundColor: P.color.bg,
    borderWidth: 1,
    borderColor: P.color.border,
    borderRadius: P.radius.md,
    minHeight: 44,
    color: P.color.text,
    fontWeight: "900",
    paddingHorizontal: 10
  },
  small: {
    color: P.color.muted,
    fontSize: 10,
    marginTop: 4,
    fontStyle: "italic"
  },
  modeRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: P.color.border,
    borderRadius: P.radius.md,
    overflow: "hidden",
    marginBottom: 12
  },
  mode: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: P.color.bg
  },
  modeActive: {
    backgroundColor: "#00E83A"
  },
  modeText: {
    color: P.color.muted,
    fontWeight: "900"
  },
  modeTextActive: {
    color: "#052E16"
  },
  buySellRow: {
    flexDirection: "row",
    gap: 10
  },
  buyBtn: {
    flex: 1,
    backgroundColor: "#006CA8",
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8
  },
  sellBtn: {
    flex: 1,
    backgroundColor: "#C82333",
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8
  },
  active: {
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  btnText: {
    color: "#FFFFFF",
    fontWeight: "900"
  }
});
