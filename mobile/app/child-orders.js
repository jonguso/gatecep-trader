import React from "react";
import { Redirect } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import ChildOrdersScreen from "../src/screens/ChildOrdersScreen";

export default function ChildOrdersRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <ChildOrdersScreen />;
}