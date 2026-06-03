import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import LoginScreen from "../src/screens/LoginScreen";

export default function LoginRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return <Redirect href="/" />;
  }

  return <LoginScreen />;
}