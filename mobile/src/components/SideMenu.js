import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import GatecepLogo from "./GatecepLogo";
import { useAuth } from "../auth/AuthContext";

export default function SideMenu({ visible, onClose }) {
  const { user, logout } = useAuth();

  const signOut = async () => {
    onClose?.();
    await logout();
    router.replace("/");
  };

  const go = (path) => {
    onClose?.();
    router.push(path);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.drawer}>
          <View style={styles.top}>
            <Pressable onPress={onClose} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
            </Pressable>
            <GatecepLogo dark />
          </View>

          <Pressable onPress={() => go("/account-profile")} style={styles.profileRow}>
            <Ionicons name="person-circle-outline" size={64} color="#B8B8B8" />
            <View>
              <Text style={styles.name}>{user?.name || user?.username || "Gatecep User"}</Text>
              <Text style={styles.email}>{user?.email || user?.username || "user@gatecep.com"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#CBD5E1" />
          </Pressable>

          <Pressable style={styles.startTrading} onPress={() => go("/(tabs)/watchlist")}>
            <Text style={styles.startTradingText}>Start Trading</Text>
          </Pressable>

          <MenuItem icon="chatbubble-ellipses-outline" label="Contact Us" />
          <MenuItem icon="share-social-outline" label="Share GATECEP" />
          <MenuItem icon="settings-outline" label="Settings" onPress={() => go("/settings")} />
          <MenuItem icon="star" label="Rate GATECEP App" color="#FACC15" />
          <MenuItem icon="document-text-outline" label="Terms of Service" />
          <MenuItem icon="shield-checkmark-outline" label="Privacy Policy" />
          <MenuItem icon="help-circle-outline" label="Show Tutorial" />

          <Pressable onPress={signOut} style={styles.menuItem}>
            <Ionicons name="log-out-outline" size={26} color="#FFFFFF" />
            <Text style={styles.menuText}>Sign Out</Text>
          </Pressable>

          <Text style={styles.footer}>v1.0.0 · © 2026 GATECEP</Text>
        </View>

        <Pressable style={styles.outside} onPress={onClose} />
      </View>
    </Modal>
  );
}

function MenuItem({ icon, label, onPress, color = "#FFFFFF" }) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <Ionicons name={icon} size={26} color={color} />
      <Text style={styles.menuText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  drawer: {
    width: "78%",
    backgroundColor: "#252637",
    paddingTop: 36,
    paddingHorizontal: 22
  },
  outside: {
    flex: 1
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18
  },
  name: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800"
  },
  email: {
    color: "#A7A7B7",
    marginTop: 4
  },
  startTrading: {
    backgroundColor: "#3CA34A",
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 4,
    marginBottom: 22
  },
  startTradingText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900"
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    paddingVertical: 15
  },
  menuText: {
    color: "#FFFFFF",
    fontSize: 18
  },
  footer: {
    color: "#8E8EA2",
    position: "absolute",
    bottom: 28,
    left: 22,
    fontSize: 12
  }
});
