import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { saveProfile } from "../../src/utils/onboardingStorage";

const brokers = [
  "AIB-AXYS",
  "ABC Capital",
  "Dyer & Blair",
  "Genghis Capital",
  "Kingdom Securities",
  "NCBA Investment Bank",
  "Standard Investment Bank",
  "Other"
];

export default function ConnectBroker() {
  const [selected, setSelected] = useState("");
  const [other, setOther] = useState("");

  async function continueNext() {
    const brokerName = selected === "Other" ? other.trim() : selected;

    if (!brokerName) return;

    const brokerProfile = {
      id: `BR-${Date.now()}`,
      broker: brokerName,
      status: "PROFILE_CREATED",
      source: "ONBOARDING",
      createdAt: new Date().toISOString()
    };

    await AsyncStorage.setItem(
      "gatecepBrokerProfile",
      JSON.stringify(brokerProfile)
    );

    await saveProfile({
      hasBroker: true,
      brokerName,
      brokerProfileCreated: true
    });

    router.push("/onboarding/upload-portfolio");
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Choose your broker</Text>

      <Text style={styles.subtitle}>
        This helps Coach G match your valuation reports and give better portfolio recommendations.
      </Text>

      {brokers.map((broker) => (
        <Pressable
          key={broker}
          style={[
            styles.card,
            selected === broker && styles.activeCard
          ]}
          onPress={() => setSelected(broker)}
        >
          <Text style={styles.cardText}>{broker}</Text>
        </Pressable>
      ))}

      {selected === "Other" && (
        <TextInput
          value={other}
          onChangeText={setOther}
          placeholder="Enter broker name"
          placeholderTextColor="#64748b"
          style={styles.input}
        />
      )}

      <Pressable
        style={[
          styles.primary,
          !selected && styles.disabled
        ]}
        disabled={!selected}
        onPress={continueNext}
      >
        <Text style={styles.primaryText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617", padding: 25 },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 70
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 12,
    marginBottom: 20,
    lineHeight: 22
  },
  card: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10
  },
  activeCard: {
    borderColor: "#67e8f9",
    backgroundColor: "rgba(6,182,212,.12)"
  },
  cardText: {
    color: "white",
    fontWeight: "800"
  },
  input: {
    backgroundColor: "#0f172a",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    color: "white",
    marginTop: 8
  },
  primary: {
    marginTop: 22,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18
  },
  disabled: {
    opacity: 0.45
  },
  primaryText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900"
  }
});