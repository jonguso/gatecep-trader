import React from "react";
import { Redirect } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import OrderBookScreen from "../src/screens/OrderBookScreen";

export default function OrderBookRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <OrderBookScreen />;
}