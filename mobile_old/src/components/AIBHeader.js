import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AIBHeader({ title, subtitle, showBack, onBack, right }) {
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <Pressable onPress={onBack} style={styles.iconButton}>
          <Ionicons name={showBack ? "chevron-back" : "menu"} size={26} color="#FFFFFF" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {right || <Ionicons name="notifications" size={22} color="#FBBF24" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#06154A", paddingTop: 22, paddingBottom: 18, paddingHorizontal: 18 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#CBD5E1", fontSize: 12, marginTop: 3 }
});
