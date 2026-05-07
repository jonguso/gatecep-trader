import { View, Text, Pressable, StyleSheet, Switch, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function Settings() {
  const [biometric, setBiometric] = useState(false);
  const [push, setPush] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <SettingRow label="Biometric Login" value={biometric} setValue={setBiometric} />
        <SettingRow label="Push Notifications" value={push} setValue={setPush} />
        <SettingRow label="Price Alerts" value={priceAlerts} setValue={setPriceAlerts} />
        <SettingRow label="Dark Trading Theme" value={darkMode} setValue={setDarkMode} />

        <Pressable onPress={() => Alert.alert("Password", "Change password flow coming next.")} style={styles.action}>
          <Text style={styles.actionText}>Change Password</Text>
        </Pressable>

        <Pressable onPress={() => Alert.alert("Security", "2FA setup coming next.")} style={styles.action}>
          <Text style={styles.actionText}>Two-Factor Authentication</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SettingRow({ label, value, setValue }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowText}>{label}</Text>
      <Switch value={value} onValueChange={setValue} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#252637" },
  header: {
    paddingTop: 38,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  back: { width: 36, height: 36, justifyContent: "center" },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  content: { padding: 16 },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: "#3A3B50",
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  rowText: { color: "#FFFFFF", fontSize: 17 },
  action: {
    backgroundColor: "#3A3B50",
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 14
  },
  actionText: { color: "#FFFFFF", fontWeight: "800" }
});
