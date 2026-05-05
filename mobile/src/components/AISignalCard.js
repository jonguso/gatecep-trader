import { View, Text, StyleSheet } from "react-native";
import { P } from "../theme/proTheme";

export default function AISignalCard({ recommendation }) {
  if (!recommendation) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Coach G Signal</Text>
        <Text style={styles.muted}>Get AI recommendation to unlock confidence and risk signals.</Text>
      </View>
    );
  }

  const signal = recommendation.signal || recommendation.action || "HOLD";
  const confidence = Number(recommendation.confidence || 0);
  const isBuy = signal === "BUY";
  const isSell = signal === "SELL";
  const color = isBuy ? P.color.green : isSell ? P.color.red : P.color.amber;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Coach G Signal</Text>

      <View style={styles.signalRow}>
        <Text style={[styles.signal, { color }]}>{confidence}% {signal}</Text>
        <Text style={styles.badge}>{recommendation.symbol}</Text>
      </View>

      <Text style={styles.text}>{recommendation.recommendationText}</Text>

      <View style={styles.scoreGrid}>
        <Score label="Momentum" value={recommendation.scores?.momentum} />
        <Score label="Liquidity" value={recommendation.scores?.liquidity} />
        <Score label="Price Risk" value={recommendation.scores?.priceRisk} />
        <Score label="Exposure" value={recommendation.scores?.exposure} />
      </View>

      {!!recommendation.riskFlags?.length && (
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Warnings</Text>
          {recommendation.riskFlags.map((x, i) => (
            <Text key={i} style={styles.warning}>• {x}</Text>
          ))}
        </View>
      )}

      {!!recommendation.reasons?.length && (
        <View style={styles.reasons}>
          {recommendation.reasons.slice(0, 4).map((x, i) => (
            <Text key={i} style={styles.reason}>• {x}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

function Score({ label, value }) {
  return (
    <View style={styles.score}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{value ?? "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: P.color.surface,
    borderRadius: P.radius.lg,
    borderWidth: 1,
    borderColor: P.color.border,
    padding: 16,
    marginHorizontal: P.spacing.screen,
    marginBottom: P.spacing.gap
  },
  title: {
    color: P.color.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8
  },
  signalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  signal: {
    fontSize: 30,
    fontWeight: "900"
  },
  badge: {
    color: P.color.blue,
    fontWeight: "900",
    backgroundColor: P.color.blueSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden"
  },
  text: {
    color: P.color.text,
    marginTop: 8,
    lineHeight: 20
  },
  muted: {
    color: P.color.muted,
    lineHeight: 20
  },
  scoreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  score: {
    width: "48%",
    backgroundColor: P.color.bg,
    borderRadius: P.radius.md,
    borderWidth: 1,
    borderColor: P.color.border,
    padding: 10
  },
  scoreLabel: {
    color: P.color.muted,
    fontSize: 11
  },
  scoreValue: {
    color: P.color.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3
  },
  warningBox: {
    backgroundColor: P.color.redSoft,
    borderWidth: 1,
    borderColor: P.color.red,
    borderRadius: P.radius.md,
    padding: 10,
    marginTop: 12
  },
  warningTitle: {
    color: P.color.red,
    fontWeight: "900",
    marginBottom: 4
  },
  warning: {
    color: P.color.text,
    lineHeight: 18
  },
  reasons: {
    marginTop: 12
  },
  reason: {
    color: P.color.muted,
    fontSize: 12,
    lineHeight: 18
  }
});
