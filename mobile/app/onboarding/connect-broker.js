import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router } from "expo-router";

import {
  userGetItem,
  userSetItem
} from "../../src/auth/userStorage";
import { addUserBroker } from "../../src/features/brokers/api/userBrokerApi";

export default function ConnectBroker() {
  const [status, setStatus] = useState("Connecting broker profile...");

  useEffect(() => {
    connect();
  }, []);

  async function connect() {
    try {
      const raw = await userGetItem("brokerProfile");
      const saved = raw ? JSON.parse(raw) : {};

      const broker = saved.broker || saved.brokerName || "GATECEP-DEMO";

      const result = await addUserBroker({
        broker,
        brokerName: saved.brokerName || broker,
        clientNumber: saved.clientNumber || "",
        cdsNumber: saved.cdsNumber || "",
        email: saved.brokerEmail || ""
      });

      await userSetItem("cloudBrokerProfile", JSON.stringify(result));
      await userSetItem("brokerProfileSkipped", "false");

      setStatus("Broker connected.");
      router.replace("/onboarding/upload-portfolio");
    } catch (error) {
      Alert.alert("Broker Connect Failed", error.message);
      router.replace("/broker-profile");
    }
  }

  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" color="#67e8f9" />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  text: {
    color: "#cbd5e1",
    marginTop: 16,
    fontWeight: "800"
  }
});