import React from "react";
import { Redirect } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import ComplianceScreen from "../src/screens/ComplianceScreen";

export default function ComplianceRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <ComplianceScreen />;
}