import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const brokers = [
  "AIB-AXYS",
  "ABC",
  "Dyer & Blair",
  "NCBA Investment Bank",
  "Standard Investment Bank",
  "Other"
];

export default function BrokerProfile() {
  const [form, setForm] = useState({
    broker: "AIB-AXYS",
    clientNumber: "",
    cdsNumber: "",
    brokerEmail: ""
  });

  const [status, setStatus] = useState("");

  useEffect(() => {
    loadExistingProfile();
  }, []);

  async function loadExistingProfile() {
    try {
      const raw = await AsyncStorage.getItem("gatecepBrokerProfile");

      if (raw) {
        const saved = JSON.parse(raw);

        setForm({
          broker: saved.broker || "AIB-AXYS",
          clientNumber: saved.clientNumber || "",
          cdsNumber: saved.cdsNumber || "",
          brokerEmail: saved.brokerEmail || ""
        });

        setStatus("Existing broker profile loaded.");
      }
    } catch (error) {
      setStatus(`Could not load broker profile: ${error.message}`);
    }
  }

  async function saveProfile() {
    try {
      const profile = {
        id: `BP-${Date.now()}`,
        broker: form.broker,
        clientNumber: form.clientNumber.trim(),
        cdsNumber: form.cdsNumber.trim(),
        brokerEmail: form.brokerEmail.trim(),
        verificationMode: "STATEMENT_MATCH",
        source: "USER_PROVIDED",
        updatedAt: new Date().toISOString()
      };

      await AsyncStorage.setItem(
        "gatecepBrokerProfile",
        JSON.stringify(profile)
      );

const brokerProfile = {
  id: profile.id,
  broker: profile.broker,
  nickname: profile.broker,
  clientNumber: profile.clientNumber,
  cdsNumber: profile.cdsNumber,
  brokerEmail: profile.brokerEmail,
  defaultBroker: true,
  linked: false,
  connectionMode: "MANUAL_PROFILE",
  verificationMode: profile.verificationMode,
  source: profile.source,
  updatedAt: profile.updatedAt
};

await AsyncStorage.setItem(
  "gatecepDefaultBrokerProfile",
  JSON.stringify(brokerProfile)
);

await AsyncStorage.setItem(
  "gatecepBrokerProfiles",
  JSON.stringify([brokerProfile])
);

      const verify = await AsyncStorage.getItem("gatecepBrokerProfile");

      if (!verify) {
        throw new Error("Save verification failed.");
      }

      setStatus("Broker profile saved successfully.");
      return true;
    } catch (error) {
      setStatus(`Save failed: ${error.message}`);
      Alert.alert("Save failed", error.message);
      return false;
    }
  }

  async function saveAndContinue() {
    const ok = await saveProfile();

    if (ok) {
      router.push("/broker-upload");
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Broker Profile</Text>

      <Text style={styles.subtitle}>
        This does not connect to your broker yet. It helps Gatecep match your
        uploaded valuation or statement to the correct broker profile.
      </Text>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Informational Only</Text>
        <Text style={styles.noticeText}>
          Gatecep uses this information to reduce statement mix-ups, especially
          if you use more than one broker.
        </Text>
      </View>

      <Text style={styles.label}>Broker</Text>

      <View style={styles.brokerGrid}>
        {brokers.map((broker) => {
          const active = form.broker === broker;

          return (
            <Pressable
              key={broker}
              onPress={() => setForm({ ...form, broker })}
              style={[
                styles.brokerOption,
                active && styles.brokerOptionActive
              ]}
            >
              <Text
                style={[
                  styles.brokerOptionText,
                  active && styles.brokerOptionTextActive
                ]}
              >
                {broker}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Input
        label="Client / Account Number"
        placeholder="Optional"
        value={form.clientNumber}
        onChangeText={(value) =>
          setForm({
            ...form,
            clientNumber: value
          })
        }
      />

      <Input
        label="CDS Number"
        placeholder="Optional"
        value={form.cdsNumber}
        onChangeText={(value) =>
          setForm({
            ...form,
            cdsNumber: value
          })
        }
      />

      <Input
        label="Broker Email"
        placeholder="Optional"
        value={form.brokerEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(value) =>
          setForm({
            ...form,
            brokerEmail: value
          })
        }
      />

      {status ? (
        <View
          style={[
            styles.statusBox,
            status.toLowerCase().includes("failed") ||
            status.toLowerCase().includes("could not")
              ? styles.statusError
              : styles.statusSuccess
          ]}
        >
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : null}

      <Pressable style={styles.primaryButton} onPress={saveAndContinue}>
        <Text style={styles.primaryText}>Save and Continue to Upload</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={saveProfile}>
        <Text style={styles.secondaryText}>Save Broker Profile Only</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/investor-home")}>
        <Text style={styles.backLink}>Back to Investor Home</Text>
      </Pressable>
    </ScrollView>
  );
}

function Input({ label, ...props }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        {...props}
        placeholderTextColor="#64748b"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 40 },
  title: { color: "white", fontSize: 32, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 22 },
  notice: {
    marginTop: 22,
    backgroundColor: "rgba(6, 182, 212, 0.10)",
    borderColor: "rgba(6, 182, 212, 0.35)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 16
  },
  noticeTitle: { color: "#67e8f9", fontWeight: "900" },
  noticeText: { color: "#cbd5e1", marginTop: 8, lineHeight: 20 },
  label: { color: "#94a3b8", fontSize: 13, marginTop: 20, marginBottom: 8 },
  brokerGrid: { gap: 10 },
  brokerOption: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  brokerOptionActive: {
    borderColor: "#9333ea",
    backgroundColor: "rgba(147, 51, 234, 0.18)"
  },
  brokerOptionText: { color: "#cbd5e1", fontWeight: "800" },
  brokerOptionTextActive: { color: "#c084fc" },
  inputWrap: { marginTop: 2 },
  input: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    color: "white"
  },
  statusBox: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14
  },
  statusSuccess: {
    backgroundColor: "rgba(34, 197, 94, 0.10)",
    borderColor: "rgba(34, 197, 94, 0.35)"
  },
  statusError: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderColor: "rgba(239, 68, 68, 0.35)"
  },
  statusText: { color: "#e2e8f0", lineHeight: 20 },
  primaryButton: {
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18,
    marginTop: 24
  },
  primaryText: { color: "white", textAlign: "center", fontWeight: "900" },
  secondaryButton: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 18,
    marginTop: 12
  },
  secondaryText: { color: "#67e8f9", textAlign: "center", fontWeight: "900" },
  backLink: { color: "#94a3b8", textAlign: "center", marginTop: 24 }
});