import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/config";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: COLORS.bg, borderTopColor: COLORS.border }, tabBarActiveTintColor: COLORS.gold, tabBarInactiveTintColor: COLORS.muted }}>
      <Tabs.Screen name="dashboard" options={{ title: "Home", tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} /> }} />
      <Tabs.Screen name="markets" options={{ title: "Markets", tabBarIcon: ({ color }) => <Ionicons name="pulse" size={20} color={color} /> }} />
      <Tabs.Screen name="brokers" options={{ title: "Brokers", tabBarIcon: ({ color }) => <Ionicons name="business" size={20} color={color} /> }} />
      <Tabs.Screen name="trade" options={{ title: "Trade", tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={20} color={color} /> }} />
      <Tabs.Screen name="coach" options={{ title: "Coach G", tabBarIcon: ({ color }) => <Ionicons name="chatbubble" size={20} color={color} /> }} />
      <Tabs.Screen name="portfolio" options={{ href: null }} />
      <Tabs.Screen name="orders" options={{ href: null }} />
    </Tabs>
  );
}
