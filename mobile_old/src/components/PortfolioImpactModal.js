import { Modal, View, Text, StyleSheet } from "react-native";
import { P } from "../theme/proTheme";
import { CTA, InfoRow } from "./ProTradingUI";
import { kes } from "../utils/money";

export default function PortfolioImpactModal({
  visible, onCancel, onOk, side, ledgerBalance, orderValue,
  brokerFee, nseLevy, cdsFee, cdscLevy, cashRequired, estimatedProceeds
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>Portfolio Impact</Text>
          <Text style={styles.subtitle}>Review the impact before Coach G decision.</Text>
          <InfoRow label="Ledger Balance" value={kes(ledgerBalance)} />
          <InfoRow label="Order Value" value={kes(orderValue)} />
          <InfoRow label="Broker Fee" value={kes(brokerFee)} />
          <InfoRow label="NSE Levy" value={kes(nseLevy)} />
          {side === "BUY" && <InfoRow label="CDS Fee" value={kes(cdsFee)} />}
          <InfoRow label="CDSC Levy" value={kes(cdscLevy)} />
          <InfoRow label={side === "BUY" ? "Cash Required" : "Estimated Proceeds"} value={kes(side === "BUY" ? cashRequired : estimatedProceeds)} tone={side === "SELL" ? "green" : undefined} />
          <CTA onPress={onOk}>OK - Continue to Coach G</CTA>
          <CTA tone="ghost" onPress={onCancel}>Cancel</CTA>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.68)", justifyContent: "center", padding: 20 },
  modal: { backgroundColor: P.color.surface, borderRadius: P.radius.xl, borderWidth: 1, borderColor: P.color.border, padding: 16 },
  title: { color: P.color.text, fontSize: 22, fontWeight: "900" },
  subtitle: { color: P.color.muted, marginTop: 4, marginBottom: 10 }
});
