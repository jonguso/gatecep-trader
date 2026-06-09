import { router } from "expo-router";
import {
  View,
  Text,
  Pressable,
  StyleSheet
} from "react-native";

import { saveProfile } from "../../src/utils/onboardingStorage";

export default function BrokerQuestion() {
  async function choose(hasBroker) {
  await saveProfile({
    hasBroker
  });

  if (hasBroker) {
    router.push("/onboarding/connect-broker");
  } else {
    router.push("/onboarding/smart-portfolio");
  }
}

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Do you already have a broker?</Text>

      <Text style={styles.subtitle}>
        Coach G can give better recommendations if we understand your existing portfolio.
      </Text>

      <Pressable style={styles.card} onPress={() => choose(true)}>
  <Text style={styles.cardTitle}>Yes, I have a broker</Text>
  <Text style={styles.cardText}>
    Create your broker profile, then upload a valuation report for more accurate recommendations.
  </Text>
</Pressable>

<Pressable style={styles.card} onPress={() => choose(false)}>
  <Text style={styles.cardTitle}>No, recommend brokers</Text>
  <Text style={styles.cardText}>
    Coach G will suggest beginner-friendly broker options and still create a starter smart portfolio.
  </Text>
</Pressable>

      <Pressable
        style={styles.skip}
        onPress={() => router.push("/onboarding/smart-portfolio")}
      >
        <Text style={styles.skipText}>Skip for now</Text>
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
    marginBottom: 28,
    lineHeight: 22
  },
  card: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16
  },
  cardTitle: { color: "#67e8f9", fontSize: 18, fontWeight: "900" },
  cardText: { color: "#cbd5e1", marginTop: 8, lineHeight: 20 },
  skip: { marginTop: 12 },
  skipText: { color: "#94a3b8", textAlign: "center", fontWeight: "800" }
});