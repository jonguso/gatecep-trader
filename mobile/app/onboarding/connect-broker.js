import { useEffect } from "react";
import { router } from "expo-router";

export default function ConnectBroker() {
  useEffect(() => {
    router.replace("/broker-profile");
  }, []);

  return null;
}