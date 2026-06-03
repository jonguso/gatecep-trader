import React from "react";
import { Redirect } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import TradingScreen from "../src/screens/TradingScreen";

export default function TradingRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <TradingScreen />;
}