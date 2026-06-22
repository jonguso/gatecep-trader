import { router } from "expo-router";
import {
  View,
  Text,
  Pressable,
  StyleSheet
} from "react-native";

import { saveProfile } from "../../src/utils/onboardingStorage";

export default function UploadPortfolio() {
  async function continueWithoutUpload() {
    await saveProfile({
      uploadedPortfolio: false
    });

    router.push("/onboarding/smart-portfolio");
  }

  async function uploadLater() {
    await saveProfile({
      uploadedPortfolio: false,
      uploadReminder: true
    });

    router.push("/onboarding/smart-portfolio");
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Improve Coach G accuracy</Text>

      <Text style={styles.subtitle}>
        If you already invest, Coach G can give stronger recommendations after reviewing your valuation report or statement.
      </Text>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Recommended reports</Text>
        <Text style={styles.noticeText}>• Portfolio valuation report</Text>
        <Text style={styles.noticeText}>• Broker statement</Text>
        <Text style={styles.noticeText}>• Transaction history</Text>
      </View>

      <Pressable
        style={styles.primary}
        onPress={() => router.push("/broker-upload")}
      >
        <Text style={styles.primaryText}>Upload Report Now</Text>
      </Pressable>

      <Pressable style={styles.secondary} onPress={uploadLater}>
        <Text style={styles.secondaryText}>Upload Later</Text>
      </Pressable>

      <Pressable style={styles.skip} onPress={continueWithoutUpload}>
        <Text style={styles.skipText}>Continue Without Upload</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617", padding: 25 },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "white",
    marginTop: 80
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 12,
    lineHeight: 22
  },
  notice: {
    marginTop: 28,
    backgroundColor: "rgba(6,182,212,.10)",
    borderColor: "rgba(6,182,212,.35)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },
  noticeTitle: { color: "#67e8f9", fontWeight: "900", marginBottom: 10 },
  noticeText: { color: "#cbd5e1", marginTop: 6 },
  primary: {
    marginTop: 28,
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18
  },
  primaryText: { color: "white", textAlign: "center", fontWeight: "900" },
  secondary: {
    marginTop: 14,
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 18
  },
  secondaryText: { color: "#67e8f9", textAlign: "center", fontWeight: "900" },
  skip: { marginTop: 20 },
  skipText: { color: "#94a3b8", textAlign: "center", fontWeight: "800" }
});