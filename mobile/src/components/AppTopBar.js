import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import GatecepLogo from "./GatecepLogo";

export default function AppTopBar({ title = "GATECEP", onMenuPress, status }) {
  return (
    <View style={styles.bar}>
      <Pressable onPress={onMenuPress} style={styles.iconBtn}>
        <Ionicons name="menu" size={28} color="#FFFFFF" />
      </Pressable>

      <View style={styles.center}>
        {title === "GATECEP" ? <GatecepLogo dark /> : <Text style={styles.title}>{title}</Text>}
      </View>

      <View style={styles.right}>
        <Pressable style={styles.iconBtn}>
          <Ionicons name="refresh" size={24} color="#E5E7EB" />
        </Pressable>

        <Pressable style={styles.iconBtn}>
          <Ionicons name="search" size={24} color="#E5E7EB" />
        </Pressable>

        <Pressable onPress={() => router.push("/account-profile")} style={styles.profileIcon}>
          <Ionicons name="person-circle-outline" size={34} color="#CBD5E1" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#202234",
    minHeight: 70,
    paddingTop: 18,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center"
  },
  iconBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center"
  },
  center: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900"
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  profileIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center"
  }
});
