import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  TextInput
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const questions = [
  {
    title: "Why are you investing?",
    subtitle: "Coach G uses this to understand your main goal.",
    field: "goal",
    options: [
      ["wealth_growth", "Grow Wealth"],
      ["dividend", "Earn Passive Income"],
      ["purchase", "Save for Future Purchase"],
      ["retirement", "Retirement"],
      ["balanced_growth", "Not Sure"]
    ]
  },
  {
    title: "How long can this money stay invested?",
    subtitle: "Longer time horizons usually allow more market risk.",
    field: "timeHorizon",
    options: [
      ["under_1_year", "Less than 1 year"],
      ["1_3_years", "1 - 3 years"],
      ["3_5_years", "3 - 5 years"],
      ["5_plus_years", "5+ years"]
    ]
  },
  {
    title: "If your investment dropped 20%, what would you do?",
    subtitle: "This helps Coach G estimate your real risk tolerance.",
    field: "marketDrop",
    options: [
      ["sell", "Sell immediately"],
      ["wait", "Wait and watch"],
      ["buy_more", "Buy more"],
      ["unsure", "I am not sure"]
    ]
  },
  {
    title: "How often do you plan to invest?",
    subtitle: "This helps Coach G plan your check-ins.",
    field: "contribution",
    options: [
      ["one_time", "One time"],
      ["monthly", "Monthly"],
      ["quarterly", "Quarterly"],
      ["flexible", "Whenever possible"]
    ]
  },
  {
    title: "How much investing experience do you have?",
    subtitle: "Coach G will adjust recommendations to your experience level.",
    field: "experience",
    options: [
      ["none", "None"],
      ["beginner", "Beginner"],
      ["some", "Some experience"],
      ["advanced", "Advanced"]
    ]
  }
];

export default function NewInvestor() {
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState("10000");
  const [result, setResult] = useState(null);

  const [answers, setAnswers] = useState({
    goal: null,
    timeHorizon: null,
    marketDrop: null,
    contribution: null,
    experience: null
  });

  const currentQuestion = questions[step];

  function selectAnswer(field, value) {
    const updated = {
      ...answers,
      [field]: value
    };

    setAnswers(updated);

    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  }

  function calculateRisk(input = answers) {
    let score = 0;

    if (input.marketDrop === "buy_more") score += 35;
    if (input.marketDrop === "wait") score += 20;
    if (input.marketDrop === "unsure") score += 12;
    if (input.marketDrop === "sell") score += 5;

    if (input.timeHorizon === "5_plus_years") score += 25;
    if (input.timeHorizon === "3_5_years") score += 18;
    if (input.timeHorizon === "1_3_years") score += 10;
    if (input.timeHorizon === "under_1_year") score += 4;

    if (input.experience === "advanced") score += 20;
    if (input.experience === "some") score += 12;
    if (input.experience === "beginner") score += 7;
    if (input.experience === "none") score += 3;

    if (input.contribution === "monthly") score += 10;
    if (input.contribution === "quarterly") score += 7;
    if (input.contribution === "flexible") score += 5;

    if (score <= 30) return "conservative";
    if (score <= 65) return "balanced";
    return "aggressive";
  }

  function investorType(goal, risk) {
    if (goal === "dividend") return "Income Builder";
    if (goal === "retirement") return "Long-Term Builder";
    if (goal === "purchase") return "Goal Saver";
    if (risk === "aggressive") return "Growth Seeker";
    return "Balanced Builder";
  }

  function recommendedBroker(risk, experience, goal) {
    if (experience === "beginner") {
      return {
        name: "AIB-AXYS",
        score: 88,
        bestFor: "Beginners and long-term investors",
        reason: "Best fit for beginners and long-term portfolio building."
      };
    }

    if (risk === "aggressive") {
      return {
        name: "ABC",
        score: 86,
        bestFor: "Active and growth-oriented investors",
        reason: "Better fit for active and growth-oriented investors."
      };
    }

    if (goal === "dividend") {
      return {
        name: "Dyer & Blair",
        score: 84,
        bestFor: "Income and research-focused investors",
        reason: "Good fit for research-focused income investors."
      };
    }

    return {
      name: "AIB-AXYS",
      score: 82,
      bestFor: "Balanced investors",
      reason: "Good fit for a balanced first investing journey."
    };
  }

  function buildStarterPlan(profile) {
    const startingAmount = Number(profile.amount || 0);

    const cashPct = profile.risk === "conservative" ? 20 : profile.risk === "aggressive" ? 10 : 15;
    const investPct = 100 - cashPct;

    const allocations =
      profile.goal === "dividend"
        ? [
            ["Dividend Stocks", 40],
            ["Banking", 25],
            ["ETF / Diversifier", 20],
            ["Cash Reserve", cashPct]
          ]
        : profile.risk === "aggressive"
        ? [
            ["Growth Stocks", 45],
            ["Banking", 25],
            ["ETF / Diversifier", 20],
            ["Cash Reserve", cashPct]
          ]
        : [
            ["ETF / Diversifier", 30],
            ["Banking", 25],
            ["Dividend Stocks", 30],
            ["Cash Reserve", cashPct]
          ];

    return {
      startingAmount,
      investPct,
      cashPct,
      totalInvested: (startingAmount * investPct) / 100,
      cashReserve: (startingAmount * cashPct) / 100,
      reviewFrequency:
        profile.contribution === "monthly"
          ? "Monthly"
          : profile.contribution === "quarterly"
          ? "Quarterly"
          : "Every 60–90 days",
      allocations: allocations.map(([name, weight]) => ({
        name,
        weight,
        amount: (startingAmount * weight) / 100
      }))
    };
  }

  async function generateProfile() {
    const risk = calculateRisk();

    const profile = {
      ...answers,
      risk,
      investorType: investorType(answers.goal, risk),
      amount: Number(amount || 0),
      customerPath: "NEW_INVESTOR",
      questionnaireCompleted: true,
      createdAt: new Date().toISOString()
    };

    const broker = recommendedBroker(
      risk,
      answers.experience,
      answers.goal
    );

    const starterPlan = buildStarterPlan(profile);

    const saved = {
      profile,
      broker,
      starterPlan
    };

    await AsyncStorage.setItem(
      "gatecepInvestorProfile",
      JSON.stringify(saved)
    );

    setResult(saved);
  }

  if (result) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Coach G Profile Ready</Text>

        <Text style={styles.subtitle}>
          Your starter profile is complete. Coach G will use this going forward
          and will not ask these questions again unless your profile becomes
          outdated.
        </Text>

        <View style={styles.profileCard}>
          <Text style={styles.cardTitle}>Investor Profile</Text>

          <Info label="Investor Type" value={result.profile.investorType} />
          <Info label="Risk" value={result.profile.risk} />
          <Info
            label="Starting Amount"
            value={`KES ${money(result.profile.amount)}`}
          />
          <Info label="Contribution" value={result.profile.contribution} />
          <Info label="Review Frequency" value={result.starterPlan.reviewFrequency} />
        </View>

        <View style={styles.brokerCard}>
          <Text style={styles.cardTitle}>Broker Option</Text>

          <Text style={styles.brokerName}>{result.broker.name}</Text>

          <Text style={styles.bodyText}>{result.broker.reason}</Text>

          <Text style={styles.score}>Score: {result.broker.score}/100</Text>

          <Text style={styles.cautionText}>
            Broker enrollment is optional for now. After enrollment, add your
            broker profile so Gatecep can match future statements correctly.
          </Text>
        </View>

        <View style={styles.profileCard}>
          <Text style={styles.cardTitle}>Starter Plan</Text>

          <Info
            label="Estimated Invested"
            value={`KES ${money(result.starterPlan.totalInvested)}`}
          />

          <Info
            label="Cash Reserve"
            value={`KES ${money(result.starterPlan.cashReserve)}`}
          />

          <Text style={styles.bodyText}>
            Suggested starting allocation:
          </Text>

          {result.starterPlan.allocations.map((item) => (
            <View key={item.name} style={styles.allocationRow}>
              <Text style={styles.allocationName}>{item.name}</Text>

              <Text style={styles.allocationValue}>
                {item.weight}% • KES {money(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Next Login Checklist</Text>

          <Text style={styles.noticeText}>
            Your checklist will now show questionnaire complete. Broker profile
            can be skipped until you enroll with a broker. Upload is not required
            yet for new investors.
          </Text>
        </View>

        <Pressable
          style={styles.primary}
          onPress={() => router.push("/starter-plan")}
        >
          <Text style={styles.primaryText}>View Detailed Starter Plan</Text>
        </Pressable>

        <Pressable
          style={styles.secondary}
          onPress={() => router.replace("/dashboard")}
        >
          <Text style={styles.secondaryText}>Return to Checklist</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>New Investor Profile</Text>

      <Text style={styles.subtitle}>
        Answer once. Coach G will save your profile and continue from it later.
      </Text>

      <View style={styles.progressCard}>
        <Text style={styles.progressText}>
          Step {Math.min(step + 1, questions.length + 1)} of{" "}
          {questions.length + 1}
        </Text>
      </View>

      {step < questions.length && (
        <View style={styles.questionBlock}>
          <Text style={styles.questionTitle}>{currentQuestion.title}</Text>

          <Text style={styles.questionSubtitle}>
            {currentQuestion.subtitle}
          </Text>

          <View style={styles.options}>
            {currentQuestion.options.map(([value, label]) => (
              <Pressable
                key={value}
                style={styles.option}
                onPress={() => selectAnswer(currentQuestion.field, value)}
              >
                <Text style={styles.optionText}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {step > 0 && (
            <Pressable
              style={styles.secondary}
              onPress={() => setStep(Math.max(step - 1, 0))}
            >
              <Text style={styles.secondaryText}>Back</Text>
            </Pressable>
          )}
        </View>
      )}

      {step === questions.length - 1 && answers.experience && (
        <View style={styles.amountCard}>
          <Text style={styles.questionTitle}>
            How much are you starting with?
          </Text>

          <Text style={styles.questionSubtitle}>
            Enter the amount Coach G should use for your starter profile.
          </Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Starting Amount"
            placeholderTextColor="#64748b"
            style={styles.input}
          />

          <View style={styles.quickAmounts}>
            {["10000", "50000", "100000"].map((value) => (
              <Pressable
                key={value}
                style={styles.quickAmount}
                onPress={() => setAmount(value)}
              >
                <Text style={styles.quickAmountText}>
                  KES {Number(value).toLocaleString()}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.primary} onPress={generateProfile}>
            <Text style={styles.primaryText}>Generate Coach G Profile</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function Info({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{String(value || "N/A")}</Text>
    </View>
  );
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#020617" },
  content: { padding: 22, paddingTop: 70, paddingBottom: 40 },
  title: { color: "white", fontSize: 32, fontWeight: "900" },
  subtitle: { color: "#94a3b8", marginTop: 10, lineHeight: 22 },
  progressCard: {
    marginTop: 24,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16
  },
  progressText: { color: "#c084fc", fontWeight: "900" },
  questionBlock: { marginTop: 24 },
  questionTitle: { color: "white", fontSize: 22, fontWeight: "900" },
  questionSubtitle: { color: "#94a3b8", marginTop: 8, lineHeight: 21 },
  options: { marginTop: 22, gap: 12 },
  option: {
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 18,
    padding: 18
  },
  optionText: { color: "white", fontWeight: "800" },
  amountCard: {
    marginTop: 24,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },
  input: {
    backgroundColor: "#020617",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    color: "white",
    marginTop: 18
  },
  quickAmounts: { flexDirection: "row", gap: 8, marginTop: 14 },
  quickAmount: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 14,
    padding: 11
  },
  quickAmountText: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center"
  },
  profileCard: {
    marginTop: 22,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },
  brokerCard: {
    marginTop: 22,
    backgroundColor: "rgba(147, 51, 234, 0.12)",
    borderColor: "rgba(147, 51, 234, 0.35)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },
  cardTitle: {
    color: "#67e8f9",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 12
  },
  brokerName: { color: "white", fontSize: 22, fontWeight: "900" },
  bodyText: { color: "#cbd5e1", marginTop: 10, lineHeight: 21 },
  score: { color: "#c084fc", fontWeight: "900", marginTop: 12 },
  cautionText: {
    color: "#fde68a",
    marginTop: 12,
    lineHeight: 20,
    fontSize: 13
  },
  notice: {
    marginTop: 22,
    backgroundColor: "rgba(245, 158, 11, 0.10)",
    borderColor: "rgba(245, 158, 11, 0.35)",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18
  },
  noticeTitle: { color: "#fde68a", fontWeight: "900" },
  noticeText: { color: "#cbd5e1", marginTop: 8, lineHeight: 20 },
  allocationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingVertical: 10,
    gap: 10
  },
  allocationName: { color: "#cbd5e1", flex: 1 },
  allocationValue: { color: "white", fontWeight: "900", textAlign: "right" },
  infoRow: {
    paddingVertical: 10,
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1
  },
  infoLabel: { color: "#94a3b8", fontSize: 12 },
  infoValue: {
    color: "white",
    fontWeight: "900",
    marginTop: 4,
    textTransform: "capitalize"
  },
  primary: {
    backgroundColor: "#9333ea",
    padding: 18,
    borderRadius: 18,
    marginTop: 24
  },
  primaryText: { color: "white", textAlign: "center", fontWeight: "900" },
  secondary: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 18,
    marginTop: 14
  },
  secondaryText: { color: "#67e8f9", textAlign: "center", fontWeight: "900" }
});