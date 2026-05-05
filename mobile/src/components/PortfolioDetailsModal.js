import { Modal, ScrollView, Text, View, StyleSheet } from "react-native";
import { P } from "../theme/proTheme";
import { CTA } from "./ProTradingUI";
import PortfolioHoldingRow from "./PortfolioHoldingRow";
import { AllocationPie, AnalyticsSummary, buildPortfolioAnalytics } from "./PortfolioAnalytics";

export default function PortfolioDetailsModal({ visible, onClose, holdings, availableFunds, onHoldingPress }) {
  const analytics = buildPortfolioAnalytics({ holdings, availableFunds });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView style={styles.page} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Portfolio Details</Text>
        <Text style={styles.subtitle}>Holdings, allocation charts, and Coach G analytics.</Text>

        <AnalyticsSummary analytics={analytics} />
        <AllocationPie title="Allocation by Securities" data={analytics.bySecurity} />
        <AllocationPie title="Allocation by Industries" data={analytics.bySector} />

        <View style={styles.card}>
          <Text style={styles.section}>Holdings</Text>
          {holdings.length === 0 && <Text style={styles.empty}>No holdings yet.</Text>}
          {holdings.map(h => (
            <PortfolioHoldingRow key={h.symbol} holding={h} onPress={() => onHoldingPress?.(h)} />
          ))}
        </View>

        <CTA onPress={onClose}>Close</CTA>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: P.color.bg },
  content: { paddingTop: 28, paddingBottom: 36 },
  title: { color: P.color.text, fontSize: 26, fontWeight: "900", marginHorizontal: P.spacing.screen },
  subtitle: { color: P.color.muted, marginHorizontal: P.spacing.screen, marginTop: 4, marginBottom: 14 },
  card: { backgroundColor: P.color.surface, borderRadius: P.radius.lg, borderWidth: 1, borderColor: P.color.border, padding: 16, marginHorizontal: P.spacing.screen, marginBottom: 12 },
  section: { color: P.color.text, fontSize: 18, fontWeight: "900", marginBottom: 8 },
  empty: { color: P.color.muted, lineHeight: 20 }
});
