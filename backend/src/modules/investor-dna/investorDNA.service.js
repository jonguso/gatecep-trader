import { saveInvestorDNA, getInvestorDNA } from "./investorDNA.repository.js";
import { validateDNAInput } from "./investorDNA.validator.js";

function calculateRiskScore(input = {}) {
  let score = 0;

  if (input.marketDrop === "BUY_MORE") score += 35;
  else if (input.marketDrop === "WAIT") score += 20;
  else if (input.marketDrop === "UNSURE") score += 12;
  else if (input.marketDrop === "SELL") score += 5;

  if (input.timeHorizon === "10_PLUS_YEARS") score += 30;
  else if (input.timeHorizon === "5_PLUS_YEARS") score += 25;
  else if (input.timeHorizon === "3_5_YEARS") score += 18;
  else if (input.timeHorizon === "1_3_YEARS") score += 10;
  else score += 4;

  if (input.experience === "ADVANCED") score += 20;
  else if (input.experience === "INTERMEDIATE") score += 14;
  else if (input.experience === "BEGINNER") score += 8;
  else score += 3;

  if (input.contribution === "MONTHLY") score += 10;
  else if (input.contribution === "QUARTERLY") score += 7;
  else if (input.contribution === "FLEXIBLE") score += 5;

  return Math.min(score, 100);
}

function mapRiskProfile(score) {
  if (score <= 30) return "CONSERVATIVE";
  if (score <= 65) return "BALANCED";
  if (score <= 85) return "GROWTH";
  return "AGGRESSIVE";
}

function calculateConfidence(input = {}) {
  const fields = ["goal", "timeHorizon", "marketDrop", "contribution", "experience"];
  const answered = fields.filter((field) => Boolean(input[field])).length;
  return Math.round((answered / fields.length) * 100);
}

function investorType(goal, riskProfile) {
  if (goal === "DIVIDEND_INCOME") return "Income Builder";
  if (goal === "RETIREMENT") return "Long-Term Builder";
  if (goal === "HOME_PURCHASE") return "Goal Saver";
  if (riskProfile === "GROWTH" || riskProfile === "AGGRESSIVE") return "Growth Seeker";
  return "Balanced Builder";
}

export function generateWealthBlueprint(dna = {}) {
  const allocationMap = {
    CONSERVATIVE: { equity: 45, cash: 35, income: 20 },
    BALANCED: { equity: 60, cash: 20, income: 20 },
    GROWTH: { equity: 75, cash: 15, income: 10 },
    AGGRESSIVE: { equity: 85, cash: 10, income: 5 }
  };

  return {
    title: "Your Wealth Blueprint",
    goal: dna.goal,
    investorType: dna.investorType,
    riskProfile: dna.riskProfile,
    strategy: dna.recommendedStrategy,
    allocation: allocationMap[dna.riskProfile] || allocationMap.BALANCED,
    coachGMessage:
      "This blueprint is designed to help you practice investing with confidence before connecting a real broker."
  };
}

export async function createInvestorDNA(userId, payload = {}) {
  const input = validateDNAInput(payload);
  const riskScore = calculateRiskScore(input);
  const riskProfile = mapRiskProfile(riskScore);
  const confidenceScore = calculateConfidence(input);
  const type = investorType(input.goal, riskProfile);

  const dna = await saveInvestorDNA(userId, {
    ...input,
    version: "1.0.0",
    riskScore,
    riskProfile,
    confidenceScore,
    investorType: type,
    recommendedStrategy: `${riskProfile} ${type}`
  });

  return {
    dna,
    wealthBlueprint: generateWealthBlueprint(dna),
    coachG: {
      message:
        "Welcome to GateCEP. I've prepared your first Wealth Blueprint based on what you've shared with me."
    }
  };
}

export async function readInvestorDNA(userId) {
  const dna = await getInvestorDNA(userId);

  if (!dna) {
    return null;
  }

  return {
    dna,
    wealthBlueprint: generateWealthBlueprint(dna)
  };
}

export async function updateInvestorDNA(userId, payload = {}) {
  const existing = await getInvestorDNA(userId);

  if (!existing) {
    throw new Error("Investor DNA not found");
  }

  const updated = await saveInvestorDNA(userId, {
    ...existing,
    ...payload
  });

  return {
    dna: updated,
    wealthBlueprint: generateWealthBlueprint(updated)
  };
}