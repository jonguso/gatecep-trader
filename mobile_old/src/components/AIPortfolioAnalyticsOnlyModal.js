import { Modal, ScrollView, Text, StyleSheet } from "react-native";
import { P } from "../theme/proTheme";
import { CTA } from "./ProTradingUI";
import {
  AnalyticsSummary,
  buildInteractiveAnalytics
} from "./InteractivePortfolioAnalytics";

export default function AIPortfolioAnalyticsOnlyModal({
  visible,
  onClose,
  holdings,
  availableFunds
}) {
  const analytics = buildInteractiveAnalytics({ holdings, availableFunds });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.title}>AI Portfolio Analytics</Text>
        <Text style={styles.subtitle}>
          Coach G risk score, concentration warnings, cash allocation, and diversification insights.
        </Text>

        <AnalyticsSummary analytics={analytics} />

        <CTA onPress={onClose}>Close Analytics</CTA>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: P.color.bg
  },
  content: {
    paddingTop: 28,
    paddingBottom: 36
  },
  title: {
    color: P.color.text,
    fontSize: 26,
    fontWeight: "900",
    marginHorizontal: P.spacing.screen
  },
  subtitle: {
    color: P.color.muted,
    marginHorizontal: P.spacing.screen,
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 19
  }
});
