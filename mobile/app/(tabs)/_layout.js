import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { P } from "../../src/theme/proTheme";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="markets"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: P.color.bg,
          borderTopColor: P.color.border,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8
        },
        tabBarActiveTintColor: P.color.blue,
        tabBarInactiveTintColor: P.color.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800"
        }
      }}
    >
      <Tabs.Screen
        name="markets"
        options={{
          title: "Markets",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="trade"
        options={{
          title: "Trade",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="swap-horizontal" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          )
        }}
      />
    </Tabs>
  );
}
