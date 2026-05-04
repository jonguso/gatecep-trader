import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { P } from "../../src/theme/proTheme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: P.color.surface,
          borderTopColor: P.color.border,
          height: 68,
          paddingTop: 8,
          paddingBottom: 8
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "800" },
        tabBarActiveTintColor: P.color.blue,
        tabBarInactiveTintColor: P.color.muted
      }}
    >
      <Tabs.Screen name="portfolio" options={{ title: "Portfolio", tabBarIcon: ({ color }) => <Ionicons name="briefcase" size={21} color={color} /> }} />
      <Tabs.Screen name="markets" options={{ title: "Markets", tabBarIcon: ({ color }) => <Ionicons name="trending-up" size={21} color={color} /> }} />
      <Tabs.Screen name="trade" options={{ title: "Trade", tabBarIcon: ({ color }) => <Ionicons name="swap-horizontal" size={22} color={color} /> }} />
      <Tabs.Screen name="coach" options={{ title: "Coach G", tabBarIcon: ({ color }) => <Ionicons name="sparkles" size={21} color={color} /> }} />
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="brokers" options={{ href: null }} />
      <Tabs.Screen name="orders" options={{ href: null }} />
    </Tabs>
  );
}
