import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet
} from "react-native";

import { API_URL } from "../config/api";

export default function CoachGScreen() {
  const [question, setQuestion] = useState(
    "Should I buy SCOM?"
  );

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello, I am Coach G. Ask me about NSE stocks, portfolio strategy, execution, or risk."
    }
  ]);

  async function askCoach() {
    if (!question.trim()) return;

    const userMessage = {
      role: "user",
      content: question
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const signalsRes = await fetch(`${API_URL}/ai/signals`);
      const signalsData = await signalsRes.json();

      let response =
        "I currently do not have enough market context.";

      if (signalsData.ok) {
        const signals = signalsData.signals || [];

        const scom = signals.find(
          (s) => s.symbol === "SCOM"
        );

        if (
          question.toUpperCase().includes("SCOM") &&
          scom
        ) {
          response = `Coach G Analysis for SCOM:

Recommendation: ${scom.recommendation}
Confidence: ${scom.confidence}%
Momentum: ${scom.momentum}
Trend: ${scom.movingAverageTrend}
Volatility: ${scom.volatility}

Risk Note:
Always size positions carefully and avoid concentration risk.`;
        } else {
          response =
            "Coach G currently supports AI guidance for major NSE counters including SCOM, EQTY, KCB, and COOP.";
        }
      }

      const assistantMessage = {
        role: "assistant",
        content: response
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Coach G encountered an error: ${error.message}`
        }
      ]);
    }

    setQuestion("");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coach G AI</Text>

      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.message,
              message.role === "user"
                ? styles.userMessage
                : styles.assistantMessage
            ]}
          >
            <Text style={styles.messageRole}>
              {message.role === "user"
                ? "You"
                : "Coach G"}
            </Text>

            <Text style={styles.messageText}>
              {message.content}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask Coach G..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <Pressable
          style={styles.sendButton}
          onPress={askCoach}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 55,
    paddingHorizontal: 16
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 18
  },

  chatContainer: {
    flex: 1
  },

  message: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12
  },

  userMessage: {
    backgroundColor: "#0891b2",
    alignSelf: "flex-end"
  },

  assistantMessage: {
    backgroundColor: "#111827",
    alignSelf: "flex-start"
  },

  messageRole: {
    color: "#cbd5e1",
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "700"
  },

  messageText: {
    color: "white",
    lineHeight: 22
  },

  inputRow: {
    flexDirection: "row",
    marginTop: 12,
    marginBottom: 18,
    gap: 10
  },

  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "white",
    padding: 14,
    borderRadius: 14
  },

  sendButton: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 14
  },

  sendText: {
    color: "white",
    fontWeight: "800"
  }
});