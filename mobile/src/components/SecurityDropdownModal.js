import { Modal, View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { P } from "../theme/proTheme";
import { kes } from "../utils/money";

export default function SecurityDropdownModal({
  visible,
  onClose,
  securities = [],
  selectedSymbol,
  onSelect
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>Select Security</Text>
          <Text style={styles.subtitle}>Choose an NSE security to update order book and order entry.</Text>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {securities.map(item => {
              const selected = item.symbol === selectedSymbol;
              const up = Number(item.changePct || 0) >= 0;

              return (
                <Pressable
                  key={item.symbol}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  style={[styles.row, selected && styles.rowSelected]}
                >
                  <View style={styles.symbolBox}>
                    <Text style={styles.symbol}>{item.symbol}</Text>
                    <Text style={styles.name} numberOfLines={1}>{item.name || "NSE Security"}</Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.price}>{kes(item.price || item.lastPrice || 0)}</Text>
                    <Text style={[styles.change, { color: up ? P.color.green : P.color.red }]}>
                      {up ? "▲" : "▼"} {Number(item.changePct || 0).toFixed(2)}%
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.70)",
    justifyContent: "center",
    padding: 18
  },
  modal: {
    maxHeight: "82%",
    backgroundColor: P.color.surface,
    borderRadius: P.radius.xl,
    borderWidth: 1,
    borderColor: P.color.border,
    padding: 16
  },
  title: {
    color: P.color.text,
    fontSize: 22,
    fontWeight: "900"
  },
  subtitle: {
    color: P.color.muted,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18
  },
  list: {
    maxHeight: 460
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: P.color.border,
    paddingVertical: 12,
    gap: 10
  },
  rowSelected: {
    backgroundColor: P.color.blueSoft,
    borderRadius: P.radius.md,
    paddingHorizontal: 10
  },
  symbolBox: {
    flex: 1
  },
  symbol: {
    color: P.color.text,
    fontSize: 16,
    fontWeight: "900"
  },
  name: {
    color: P.color.muted,
    fontSize: 11,
    marginTop: 3
  },
  price: {
    color: P.color.text,
    fontWeight: "900"
  },
  change: {
    fontWeight: "900",
    fontSize: 11,
    marginTop: 3
  },
  close: {
    backgroundColor: P.color.blue,
    minHeight: 46,
    borderRadius: P.radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14
  },
  closeText: {
    color: P.color.white,
    fontWeight: "900"
  }
});
