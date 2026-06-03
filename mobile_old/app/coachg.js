import React from "react";
import { Redirect } from "expo-router";

import { useAuth } from "../src/context/AuthContext";
import CoachGScreen from "../src/screens/CoachGScreen";

export default function CoachGRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <CoachGScreen />;
}