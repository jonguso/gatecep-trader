import React from "react";
import { Redirect } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import AdminOpsScreen from "../src/screens/AdminOpsScreen";

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <AdminOpsScreen />;
}