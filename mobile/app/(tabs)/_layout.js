import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: "#0b0e11", borderTopColor: "#263241" },
      tabBarActiveTintColor: "#f0b90b",
      tabBarInactiveTintColor: "#9ca3af"
    }}>
      <Tabs.Screen name="dashboard" options={{ title: "Home", tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} /> }} />
      <Tabs.Screen name="brokers" options={{ title: "Brokers", tabBarIcon: ({ color }) => <Ionicons name="business" size={20} color={color} /> }} />
      <Tabs.Screen name="trade" options={{ title: "Trade", tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={20} color={color} /> }} />
      <Tabs.Screen name="portfolio" options={{ title: "Portfolio", tabBarIcon: ({ color }) => <Ionicons name="wallet" size={20} color={color} /> }} />
      <Tabs.Screen name="coach" options={{ title: "Coach G", tabBarIcon: ({ color }) => <Ionicons name="chatbubble" size={20} color={color} /> }} />
    </Tabs>
  );
}
