import { Modal, View, Text, StyleSheet } from "react-native";
import { P } from "../theme/proTheme";
import { CTA } from "./ProTradingUI";

export default function CoachGDecisionModal({ visible, recommendation, onAccept, onOverride, onCancel }) {
  const confidence = Number(recommendation?.confidence || 0);
  const signal = recommendation?.signal || recommendation?.action || "REVIEW";
  const risks = recommendation?.riskFlags || [];
  const reasons = recommendation?.reasons || [];
  const color = signal === "BUY" ? P.color.green : signal === "SELL" ? P.color.red : P.color.amber;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>Coach G Decision</Text>
          <Text style={[styles.signal, { color }]}>{confidence}% {signal}</Text>
          <Text style={styles.body}>
            {recommendation?.recommendationText || "Coach G recommends reviewing this order before submitting."}
          </Text>

          {risks.length > 0 && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Warnings</Text>
              {risks.map((x, i) => <Text key={i} style={styles.warning}>• {x}</Text>)}
            </View>
          )}

          {reasons.length > 0 && (
            <View style={styles.reasons}>
              {reasons.slice(0, 4).map((x, i) => <Text key={i} style={styles.reason}>• {x}</Text>)}
            </View>
          )}

          <CTA onPress={onAccept}>Accept Coach G Decision</CTA>
          <CTA tone="ghost" onPress={onOverride}>Ignore & Proceed Manually</CTA>
          <CTA tone="ghost" onPress={onCancel}>Cancel</CTA>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.70)", justifyContent: "center", padding: 20 },
  modal: { backgroundColor: P.color.surface, borderRadius: P.radius.xl, borderWidth: 1, borderColor: P.color.border, padding: 16 },
  title: { color: P.color.text, fontSize: 22, fontWeight: "900" },
  signal: { fontSize: 34, fontWeight: "900", marginTop: 12 },
  body: { color: P.color.text, marginTop: 8, lineHeight: 20 },
  warningBox: { backgroundColor: P.color.redSoft, borderWidth: 1, borderColor: P.color.red, borderRadius: P.radius.md, padding: 10, marginTop: 12 },
  warningTitle: { color: P.color.red, fontWeight: "900", marginBottom: 4 },
  warning: { color: P.color.text, lineHeight: 18 },
  reasons: { marginTop: 12 },
  reason: { color: P.color.muted, fontSize: 12, lineHeight: 18 }
});
