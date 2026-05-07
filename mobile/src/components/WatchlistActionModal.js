import { Modal, View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";

export default function WatchlistActionModal({
  visible,
  mode,
  onClose,
  securities = [],
  query,
  setQuery,
  selected = [],
  toggleSecurity
}) {
  const isAdd = mode === "add";
  const title = isAdd ? "Add Securities" : "Customize Watchlist";

  const filtered = securities
    .filter(x => {
      const q = String(query || "").toLowerCase();
      if (!q) return true;
      return String(x.symbol || "").toLowerCase().includes(q) || String(x.name || "").toLowerCase().includes(q);
    })
    .slice(0, 100);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {isAdd
              ? "Search and add NSE securities to your watchlist."
              : "Select which securities should appear in this watchlist."}
          </Text>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search symbol or company"
            placeholderTextColor="#94A3B8"
            style={styles.search}
          />

          <ScrollView style={styles.list}>
            {filtered.map(item => {
              const picked = selected.includes(item.symbol);

              return (
                <Pressable
                  key={item.symbol}
                  onPress={() => toggleSecurity(item.symbol)}
                  style={[styles.row, picked && styles.rowPicked]}
                >
                  <View>
                    <Text style={styles.symbol}>{item.symbol}</Text>
                    <Text style={styles.name} numberOfLines={1}>{item.name || "NSE Security"}</Text>
                  </View>

                  <Text style={[styles.action, picked && styles.picked]}>
                    {picked ? "✓ Added" : "+ Add"}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    padding: 18
  },
  modal: {
    maxHeight: "84%",
    backgroundColor: "#111D35",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,.28)",
    padding: 16
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900"
  },
  subtitle: {
    color: "#94A3B8",
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18
  },
  search: {
    minHeight: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,.28)",
    color: "#FFFFFF",
    paddingHorizontal: 14,
    marginBottom: 12
  },
  list: {
    maxHeight: 430
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,.18)",
    paddingVertical: 12,
    gap: 12
  },
  rowPicked: {
    backgroundColor: "rgba(34,211,238,.10)",
    borderRadius: 10,
    paddingHorizontal: 10
  },
  symbol: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16
  },
  name: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 3,
    maxWidth: 210
  },
  action: {
    color: "#38BDF8",
    fontWeight: "900"
  },
  picked: {
    color: "#22C55E"
  },
  closeBtn: {
    backgroundColor: "#0B5CFF",
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14
  },
  closeText: {
    color: "#FFFFFF",
    fontWeight: "900"
  }
});
