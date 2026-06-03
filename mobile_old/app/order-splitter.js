import React from "react";
import { Redirect } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import OrderSplitterScreen from "../src/screens/OrderSplitterScreen";

export default function OrderSplitterRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <OrderSplitterScreen />;
}