import React from "react";
import { Redirect } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import PortfolioScreen from "../src/screens/PortfolioScreen";

export default function PortfolioRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <PortfolioScreen />;
}