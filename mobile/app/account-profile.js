import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../src/auth/AuthContext";

export default function AccountProfile() {
  const { user, logout } = useAuth();

  const signOut = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Account Profile</Text>
      </View>

      <ScrollView>
        <View style={styles.profileHero}>
          <Ionicons name="person-circle-outline" size={150} color="#B8B8B8" />
          <View style={styles.heroActions}>
            <Ionicons name="videocam" size={26} color="#FFFFFF" />
            <Ionicons name="folder" size={26} color="#FFFFFF" />
            <Ionicons name="trash" size={26} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GATECEP Account Details</Text>

          <ProfileRow label="Name" value={user?.name || user?.username || "Gatecep User"} />
          <ProfileRow label="Email" value={user?.email || user?.username || "user@gatecep.com"} rightLabel="Change Password" onRight={() => Alert.alert("Change Password", "Password change flow coming next.")} />
          <ProfileRow label="Account Number" value={user?.customerNumber || "GTC-DEMO-000001"} rightLabel="Deregister" danger onRight={() => Alert.alert("Deregister", "Account deregistration requires verification.")} />

          <Text style={styles.sectionTitle}>Trading Account Details</Text>

          <View style={styles.tradeRow}>
            <Text style={styles.tradeText}>Setup Trading Account</Text>
            <Pressable onPress={() => router.push("/(tabs)/watchlist")} style={styles.startBtn}>
              <Text style={styles.startText}>Start Trading</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Mobile Numbers</Text>
          <Pressable style={styles.mobileRow}>
            <View>
              <Text style={styles.phone}>+18328743555</Text>
              <Text style={styles.note}>not verified - tap to verify</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
          </Pressable>

          <Text style={styles.sectionTitle}>Additional Email Addresses</Text>

          <Pressable onPress={() => router.push("/settings")} style={styles.fullBtn}>
            <Text style={styles.fullBtnText}>Settings</Text>
          </Pressable>

          <Pressable onPress={signOut} style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function ProfileRow({ label, value, rightLabel, onRight, danger }) {
  return (
    <View style={styles.profileRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      {!!rightLabel && (
        <Pressable onPress={onRight} style={[styles.smallBtn, danger && styles.dangerBtn]}>
          <Text style={[styles.smallBtnText, danger && styles.dangerText]}>{rightLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#252637" },
  header: {
    backgroundColor: "#252637",
    paddingTop: 38,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  back: { width: 36, height: 36, justifyContent: "center" },
  headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  profileHero: {
    backgroundColor: "#3A3B50",
    minHeight: 210,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 42
  },
  heroActions: { gap: 30 },
  section: { padding: 16 },
  sectionTitle: { color: "#1D9BFF", fontWeight: "900", marginTop: 12, marginBottom: 8 },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#3A3B50",
    paddingVertical: 10
  },
  value: { color: "#FFFFFF", fontSize: 18 },
  label: { color: "#9CA3AF", fontSize: 15, marginTop: 3 },
  smallBtn: { backgroundColor: "#55576E", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 4 },
  smallBtnText: { color: "#FFFFFF", fontWeight: "700" },
  dangerBtn: { backgroundColor: "#55576E" },
  dangerText: { color: "#FF7A7A" },
  tradeRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#3A3B50",
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center"
  },
  tradeText: { color: "#FFFFFF", fontSize: 18, flex: 1 },
  startBtn: { backgroundColor: "#3CA34A", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 4 },
  startText: { color: "#FFFFFF", fontWeight: "900" },
  mobileRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#3A3B50",
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  phone: { color: "#F97316", fontSize: 18 },
  note: { color: "#9CA3AF", marginTop: 4 },
  fullBtn: { backgroundColor: "#0B5CFF", minHeight: 48, borderRadius: 6, alignItems: "center", justifyContent: "center", marginTop: 24 },
  fullBtnText: { color: "#FFFFFF", fontWeight: "900" },
  signOutBtn: { borderWidth: 1, borderColor: "#EF4444", minHeight: 48, borderRadius: 6, alignItems: "center", justifyContent: "center", marginTop: 14 },
  signOutText: { color: "#EF4444", fontWeight: "900" }
});
