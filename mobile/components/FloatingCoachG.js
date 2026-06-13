import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { loadPortfolio } from "../src/portfolio/portfolioStore";
import { userGetItem } from "../src/auth/userStorage";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://10.0.0.168:4000";

const prompts = [
  "Should I buy SCOM today?",
  "Analyze my portfolio risk",
  "What should I watch today?",
  "How can I reduce risk?"
];

export default function FloatingCoachG() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  async function buildCoachContext() {
    const portfolio = await loadPortfolio({ revalue: true });

    const cashRaw = await userGetItem("availableCash");
    const profileRaw = await userGetItem("investorProfile");
    const watchlistRaw = await userGetItem("watchlists");
    const latestDecisionRaw = await userGetItem("latestCoachDecision");
    const syncStatusRaw = await userGetItem("syncStatus");
    const tradesRaw = await userGetItem("simulatedTrades");

    const cash = Number(cashRaw || 0);
    const profile = profileRaw ? JSON.parse(profileRaw) : null;
    const watchlists = watchlistRaw ? JSON.parse(watchlistRaw) : {};
    const latestDecision = latestDecisionRaw ? JSON.parse(latestDecisionRaw) : null;
    const syncStatus = syncStatusRaw ? JSON.parse(syncStatusRaw) : null;
    const trades = tradesRaw ? JSON.parse(tradesRaw) : [];

    const totalValue = portfolio.reduce(
      (sum, item) => sum + Number(item.marketValue || item.value || 0),
      0
    );

    const sectorTotals = {};

    portfolio.forEach((item) => {
      const sector = item.sector || "Unknown";

      sectorTotals[sector] =
        (sectorTotals[sector] || 0) +
        Number(item.marketValue || item.value || 0);
    });

    const largestSector =
      Object.entries(sectorTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      cash,
      totalValue,
      holdingCount: portfolio.length,
      largestSector,
      profile: profile?.profile || profile,
      watchlists,
      latestDecision,
      syncStatus,
      recentTrades: trades.slice(0, 5),
      holdings: portfolio.map((item) => ({
        symbol: item.symbol,
        sector: item.sector,
        quantity: item.quantity,
        marketValue: item.marketValue || item.value,
        profitLoss: item.profitLoss || 0,
        profitLossPct: item.profitLossPct || 0
      }))
    };
  }

  async function askCoachG(promptText = question) {
    const finalQuestion = String(promptText || "").trim();

    if (!finalQuestion) {
      setAnswer("Ask Coach G a question first.");
      return;
    }

    try {
      setLoading(true);
      setAnswer("Coach G is analyzing...");
      setMeta(null);

      const res = await fetch(`${API_URL}/coach/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: finalQuestion,
          context: await buildCoachContext()
        })
      });

      const data = await res.json();

      if (!data.ok) {
        setAnswer(data.error || "Coach G could not analyze this request.");
        return;
      }

      setAnswer(data.answer || "No answer returned.");

      setMeta({
        confidence: data.confidence,
        recommendation: data.recommendation
      });
    } catch (error) {
      setAnswer(`Coach G error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal visible={open} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.panel}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Coach G AI</Text>
                <Text style={styles.subtitle}>NSE Investing Assistant</Text>
              </View>

              <Pressable onPress={() => setOpen(false)}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>

            {prompts.map((item) => (
              <Pressable
                key={item}
                style={styles.prompt}
                onPress={() => {
                  setQuestion(item);
                  askCoachG(item);
                }}
              >
                <Text style={styles.promptText}>{item}</Text>
              </Pressable>
            ))}

            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask Coach G anything..."
              placeholderTextColor="#64748b"
              style={styles.input}
            />

            <Pressable
              style={styles.askButton}
              disabled={loading}
              onPress={() => askCoachG()}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.askText}>Ask Coach G</Text>
              )}
            </Pressable>

            {!!answer && (
              <View style={styles.answerBox}>
                {meta && (
                  <View style={styles.metaRow}>
                    {meta.confidence !== undefined && (
                      <Text style={styles.metaChip}>
                        {meta.confidence}% Confidence
                      </Text>
                    )}

                    {meta.recommendation && (
                      <Text style={styles.metaChip}>
                        {meta.recommendation}
                      </Text>
                    )}
                  </View>
                )}

                <Text style={styles.answer}>{answer}</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Pressable style={styles.floating} onPress={() => setOpen(true)}>
        <Text style={styles.floatingText}>G</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.65)",
    justifyContent: "flex-end",
    padding: 16
  },
  panel: {
    backgroundColor: "#0f172a",
    borderColor: "#22d3ee",
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginBottom: 24
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "900"
  },
  subtitle: {
    color: "#67e8f9",
    marginTop: 4
  },
  close: {
    color: "white",
    fontSize: 22,
    fontWeight: "900"
  },
  prompt: {
    backgroundColor: "#020617",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 10
  },
  promptText: {
    color: "#cbd5e1",
    fontWeight: "800"
  },
  input: {
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    color: "white",
    marginTop: 14
  },
  askButton: {
    backgroundColor: "#0891b2",
    padding: 16,
    borderRadius: 14,
    marginTop: 12
  },
  askText: {
    color: "white",
    textAlign: "center",
    fontWeight: "900"
  },
  answerBox: {
    backgroundColor: "rgba(6,182,212,.10)",
    borderColor: "rgba(6,182,212,.35)",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 14
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8
  },
  metaChip: {
    color: "#67e8f9",
    backgroundColor: "#020617",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "900"
  },
  answer: {
    color: "#cbd5e1",
    lineHeight: 21
  },
  floating: {
    position: "absolute",
    right: 22,
    bottom: 90,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#22d3ee",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22d3ee",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8
  },
  floatingText: {
    color: "#020617",
    fontSize: 28,
    fontWeight: "900"
  }
});