import React from "react";
import { Redirect } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import ExecutionAdvisorScreen from "../src/screens/ExecutionAdvisorScreen";

export default function ExecutionAdvisorRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <ExecutionAdvisorScreen />;
}