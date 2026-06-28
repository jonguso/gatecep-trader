import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { router } from "expo-router";

import {
  getInvestorProfile,
  saveInvestorProfile
} from "../src/features/profile/api/investorProfileApi";

import { userSetItem } from "../src/auth/userStorage";

const GOALS = ["Build Wealth", "Dividend Income", "Retirement", "Education", "Preserve Capital"];
const RISKS = ["Conservative", "Balanced", "Growth", "Aggressive"];
const EXPERIENCE = ["Beginner", "Intermediate", "Advanced"];

export default function InvestorProfileEdit() {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Build Wealth");
  const [risk, setRisk] = useState("Balanced");
  const [experience, setExperience] = useState("Beginner");

  useEffect(() => {
    load();
  }, []);

  async function load() {
  try {
    const data = await getInvestorProfile();
    const saved = data?.profile || {};

    setName(saved.name || "");
    setGoal(saved.goal || "Build Wealth");
    setRisk(saved.risk || "Balanced");
    setExperience(saved.experience || "Beginner");
  } catch (error) {
    console.log("Investor profile load error:", error.message);
  }
}

  async function save() {
  try {
    const profile = {
      name,
      goal,
      risk,
      experience,
      savedAt: new Date().toISOString()
    };

    const result = await saveInvestorProfile(profile);

    await userSetItem(
      "investorProfile",
      JSON.stringify(result.profile || profile)
    );

    Alert.alert("Profile Saved", "Investor profile saved to GateCEP cloud.");
    router.replace("/my-profile");
  } catch (error) {
    Alert.alert("Save Failed", error.message);
  }
}

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit Investor Profile</Text>

      <Text style={styles.subtitle}>
        Update your goal, risk profile, and experience level.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#64748b"
          style={styles.input}
        />

        <PickerGroup
          title="Goal"
          items={GOALS}
          value={goal}
          onChange={setGoal}
        />

        <PickerGroup
          title="Risk"
          items={RISKS}
          value={risk}
          onChange={setRisk}
        />

        <PickerGroup
          title="Experience"
          items={EXPERIENCE}
          value={experience}
          onChange={setExperience}
        />

        <Pressable style={styles.primary} onPress={save}>
          <Text style={styles.primaryText}>Save Investor Profile</Text>
        </Pressable>

        <Pressable
          style={styles.secondary}
          onPress={() => router.replace("/my-profile")}
        >
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function PickerGroup({ title, items, value, onChange }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{title}</Text>

      <View style={styles.chipRow}>
        {items.map((item) => (
          <Pressable
            key={item}
            style={[
              styles.chip,
              value === item && styles.chipActive
            ]}
            onPress={() => onChange(item)}
          >
            <Text
              style={
                value === item
                  ? styles.chipTextActive
                  : styles.chipText
              }
            >
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 120 },

  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "900"
  },

  subtitle: {
    color: "#94a3b8",
    marginTop: 8,
    lineHeight: 22
  },

  card: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 22,
    padding: 18
  },

  label: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 8,
    marginTop: 12
  },

  input: {
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    color: "white"
  },

  group: {
    marginTop: 12
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },

  chip: {
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14
  },

  chipActive: {
    backgroundColor: "#9333ea",
    borderColor: "#c084fc"
  },

  chipText: {
    color: "#94a3b8",
    fontWeight: "900"
  },

  chipTextActive: {
    color: "white",
    fontWeight: "900"
  },

  primary: {
    marginTop: 22,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18
  },

  primaryText: {
    color: "white",
    fontWeight: "900",
    textAlign: "center"
  },

  secondary: {
    marginTop: 12,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 16
  },

  secondaryText: {
    color: "#67e8f9",
    fontWeight: "900",
    textAlign: "center"
  }
});